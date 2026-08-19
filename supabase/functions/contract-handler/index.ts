import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const brevoApiKey = Deno.env.get("BREVO_API_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration env variables.");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const body = await req.json();
    const { action, ...payload } = body;

    if (action === "finalize") {
      const {
        contract_reference,
        client_name,
        client_email,
        client_phone,
        project_name,
        budget,
        electronic_signature,
        pdf_base64
      } = payload;

      if (!contract_reference || !client_name || !client_email || !project_name || !pdf_base64) {
        return new Response(
          JSON.stringify({ error: "Missing required contract fields." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // 1. Check duplicate / already finalized
      const { data: existing, error: getErr } = await supabaseAdmin
        .from("contracts")
        .select("*")
        .eq("contract_reference", contract_reference)
        .maybeSingle();

      if (existing && existing.contract_status === "Finalized") {
        // Return existing contract & signed URL
        const pathOnly = existing.pdf_storage_path.replace("contracts/", "");
        const { data: signedData } = await supabaseAdmin.storage
          .from("contracts")
          .createSignedUrl(pathOnly, 60 * 60 * 24 * 7); // 7 days

        return new Response(
          JSON.stringify({ 
            success: true, 
            contract: existing, 
            signedUrl: signedData?.signedUrl 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // 2. Upload PDF
      const pdfBytes = Uint8Array.from(atob(pdf_base64), (c) => c.charCodeAt(0));
      const pdfPath = `${contract_reference}/final-contract.pdf`;

      const { error: uploadErr } = await supabaseAdmin.storage
        .from("contracts")
        .upload(pdfPath, pdfBytes, {
          contentType: "application/pdf",
          upsert: true
        });

      if (uploadErr) {
        throw new Error(`Failed to upload PDF to storage: ${uploadErr.message}`);
      }

      // 3. Database Insertion/Update
      const accepted_at = new Date().toISOString();
      const contractData = {
        contract_reference,
        client_name,
        client_email,
        client_phone: client_phone || null,
        project_name,
        budget: Number(budget),
        electronic_signature,
        contract_status: "Finalized",
        accepted_at,
        pdf_storage_path: `contracts/${pdfPath}`,
        updated_at: accepted_at
      };

      let dbError;
      let finalRecord;

      if (existing) {
        const { data: updated, error: updateErr } = await supabaseAdmin
          .from("contracts")
          .update(contractData)
          .eq("contract_reference", contract_reference)
          .select()
          .single();
        dbError = updateErr;
        finalRecord = updated;
      } else {
        const { data: inserted, error: insertErr } = await supabaseAdmin
          .from("contracts")
          .insert({
            ...contractData,
            contract_version: 1
          })
          .select()
          .single();
        dbError = insertErr;
        finalRecord = inserted;
      }

      if (dbError) {
        throw new Error(`Database transaction failed: ${dbError.message}`);
      }

      // 4. Generate short-lived signed URL for client and admin access
      const { data: signedData, error: signErr } = await supabaseAdmin.storage
        .from("contracts")
        .createSignedUrl(pdfPath, 60 * 60 * 24 * 7); // Valid for 7 days

      const clientDownloadUrl = signedData?.signedUrl || "";

      // 5. Send Email Notifications via Brevo (Sendinblue) API
      let emailError = null;
      if (brevoApiKey) {
        try {
          // Admin notification email
          const adminRes = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
              "accept": "application/json",
              "api-key": brevoApiKey,
              "content-type": "application/json"
            },
            body: JSON.stringify({
              sender: { name: "Crestora Studios", email: "crestorastudios@gmail.com" },
              to: [{ email: "crestorastudios@gmail.com", name: "Crestora Admin" }],
              subject: `New Contract Finalized — ${contract_reference}`,
              htmlContent: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                  <div style="background-color: #2F4156; padding: 24px; text-align: center; color: white;">
                    <h2 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;">CRESTORA STUDIOS</h2>
                    <p style="margin: 4px 0 0 0; font-size: 11px; opacity: 0.7; letter-spacing: 0.15em; text-transform: uppercase;">Control Center</p>
                  </div>
                  <div style="padding: 32px; background-color: #ffffff;">
                    <p style="font-weight: 700; font-size: 16px; margin-top: 0;">New Contract Finalized</p>
                    <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
                      <tr>
                        <td style="padding: 8px 0; font-weight: 600; width: 40%; color: #64748b;">Contract Reference:</td>
                        <td style="padding: 8px 0; font-weight: 700; color: #0f172a;">${contract_reference}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-weight: 600; color: #64748b;">Client Name:</td>
                        <td style="padding: 8px 0; color: #0f172a;">${client_name}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-weight: 600; color: #64748b;">Client Email:</td>
                        <td style="padding: 8px 0; color: #0f172a;"><a href="mailto:${client_email}" style="color: #567C8D; text-decoration: none;">${client_email}</a></td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-weight: 600; color: #64748b;">Client Phone:</td>
                        <td style="padding: 8px 0; color: #0f172a;">${client_phone || "—"}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-weight: 600; color: #64748b;">Project Title:</td>
                        <td style="padding: 8px 0; color: #0f172a;">${project_name}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-weight: 600; color: #64748b;">Project Budget:</td>
                        <td style="padding: 8px 0; font-weight: 700; color: #0f172a;">INR ${Number(budget).toLocaleString("en-IN")}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-weight: 600; color: #64748b;">Electronic Signature:</td>
                        <td style="padding: 8px 0; font-style: italic; font-weight: 600; color: #0f172a;">${electronic_signature}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-weight: 600; color: #64748b;">Accepted At:</td>
                        <td style="padding: 8px 0; color: #0f172a;">${accepted_at}</td>
                      </tr>
                    </table>
                    <div style="text-align: center; margin-top: 32px;">
                      <a href="${clientDownloadUrl}" style="background-color: #567C8D; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px; letter-spacing: 0.05em; display: inline-block;">DOWNLOAD CONTRACT PDF</a>
                    </div>
                  </div>
                  <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
                    This is an automated system notification from Crestora OS.
                  </div>
                </div>
              `
            })
          });

          if (!adminRes.ok) {
            console.error("Admin notification mail failed:", await adminRes.text());
          }

          // Client confirmation email
          const clientRes = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
              "accept": "application/json",
              "api-key": brevoApiKey,
              "content-type": "application/json"
            },
            body: JSON.stringify({
              sender: { name: "Crestora Studios", email: "crestorastudios@gmail.com" },
              to: [{ email: client_email, name: client_name }],
              subject: `Crestora Studios — Contract Confirmation — ${contract_reference}`,
              htmlContent: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                  <div style="background-color: #2F4156; padding: 24px; text-align: center; color: white;">
                    <h2 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;">CRESTORA STUDIOS</h2>
                    <p style="margin: 4px 0 0 0; font-size: 10px; opacity: 0.7; letter-spacing: 0.2em; text-transform: uppercase;">Creative Technology & Digital Studio</p>
                  </div>
                  <div style="padding: 32px; background-color: #ffffff;">
                    <p style="font-size: 14px; margin-top: 0; color: #475569;">Dear ${client_name},</p>
                    <p style="font-size: 14px; color: #475569;">Thank you for choosing Crestora Studios. We are pleased to confirm that your project contract has been successfully accepted and finalized.</p>
                    
                    <div style="background-color: #f8fafc; border-left: 4px solid #567C8D; padding: 16px 20px; margin: 24px 0; border-radius: 4px;">
                      <h4 style="margin: 0 0 8px 0; font-size: 12px; color: #567C8D; text-transform: uppercase; letter-spacing: 0.05em;">Agreement Details</h4>
                      <p style="margin: 4px 0; font-size: 13px;"><strong>Contract Reference:</strong> ${contract_reference}</p>
                      <p style="margin: 4px 0; font-size: 13px;"><strong>Project Name:</strong> ${project_name}</p>
                      <p style="margin: 4px 0; font-size: 13px;"><strong>Project Budget:</strong> INR ${Number(budget).toLocaleString("en-IN")}</p>
                      <p style="margin: 4px 0; font-size: 13px;"><strong>Acceptance Date:</strong> ${accepted_at}</p>
                      <p style="margin: 4px 0; font-size: 13px;"><strong>Electronic Signature:</strong> ${electronic_signature}</p>
                    </div>

                    <p style="font-size: 14px; color: #475569;">You can securely view and download your copy of the finalized contract by clicking the link below:</p>
                    
                    <div style="text-align: center; margin: 32px 0;">
                      <a href="${clientDownloadUrl}" style="background-color: #567C8D; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px; letter-spacing: 0.05em; display: inline-block;">DOWNLOAD CONTRACT PDF</a>
                    </div>

                    <p style="font-size: 13px; color: #64748b;">Note: The download link above is secure and will remain active for 7 days. If you require access after expiration, please contact our team.</p>
                    
                    <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 32px 0;" />
                    <p style="font-size: 14px; margin-bottom: 0; color: #475569;">Best regards,<br/><strong>Crestora Studios Team</strong></p>
                  </div>
                  <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
                    Email: <a href="mailto:crestorastudios@gmail.com" style="color: #567C8D; text-decoration: none;">crestorastudios@gmail.com</a>
                  </div>
                </div>
              `
            })
          });

          if (!clientRes.ok) {
            console.error("Client confirmation mail failed:", await clientRes.text());
          }
        } catch (e) {
          console.error("Brevo API delivery error:", e);
          emailError = e.message;
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          contract: finalRecord, 
          signedUrl: clientDownloadUrl,
          emailError
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "get_contract") {
      const { reference } = payload;
      if (!reference) {
        return new Response(
          JSON.stringify({ error: "Missing contract reference." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data, error } = await supabaseAdmin
        .from("contracts")
        .select("*")
        .eq("contract_reference", reference)
        .maybeSingle();

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!data) {
        return new Response(
          JSON.stringify({ error: "Contract not found." }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      let signedUrl = "";
      if (data.contract_status === "Finalized" && data.pdf_storage_path) {
        const pathOnly = data.pdf_storage_path.replace("contracts/", "");
        const { data: signedData } = await supabaseAdmin.storage
          .from("contracts")
          .createSignedUrl(pathOnly, 60 * 60 * 24); // 24 hours
        signedUrl = signedData?.signedUrl || "";
      }

      return new Response(
        JSON.stringify({ success: true, contract: data, signedUrl }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

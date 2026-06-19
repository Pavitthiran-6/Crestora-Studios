import React, { useState, useEffect } from 'react';
import './LapisCardHand.css';

const IMAGES = {
  abbas: "/muhamed_abbas.jpg",
  palani: "/palaniappan.jpg",
  pavit: "/pavitthiran.jpg",
  muthukuran: "/muthukuran.png",
  aslam: "/muhamed_aslam.jpg",
  logo: "/crestora_logo.png",
};

interface CardMember {
  id: string;
  name: string;
  title: string;
  role: string;
  avatarUrl: string;
  classPrefix: string;
  description: string;
  gemstoneColor: string;
}

const members: CardMember[] = [
  {
    id: 'abbas',
    name: 'Muhamed Abbas',
    title: 'Creative Operations Lead',
    role: 'Management • Video • Design',
    avatarUrl: IMAGES.abbas,
    classPrefix: 'polyphemus',
    description: 'Spearheading creative direction, media editing, and conceptual visual workflows.',
    gemstoneColor: 'orange'
  },
  {
    id: 'palani',
    name: 'Palaniappan',
    title: 'UI Developer',
    role: 'Technical Associate',
    avatarUrl: IMAGES.palani,
    classPrefix: 'andromeda',
    description: 'Crafting responsive layout architectures and pixel-perfect interactive design systems.',
    gemstoneColor: 'blue'
  },
  {
    id: 'pavit',
    name: 'Pavitthiran',
    title: 'Developer',
    role: 'Full-Stack Developer',
    avatarUrl: IMAGES.pavit,
    classPrefix: 'cerberus',
    description: 'Engineering database connections, backend structures, and web applications.',
    gemstoneColor: 'red'
  },
  {
    id: 'muthukuran',
    name: 'Muthukuran',
    title: 'Creative Motion Director',
    role: '3D Animation • Poster • Motion',
    avatarUrl: IMAGES.muthukuran,
    classPrefix: 'nyx',
    description: 'Crafting cinematic 3D animations, striking poster designs, and immersive motion graphics.',
    gemstoneColor: 'purple'
  },
  {
    id: 'aslam',
    name: 'Muhamed Aslam',
    title: 'Sales Executive',
    role: 'Sales & Client Relations',
    avatarUrl: IMAGES.aslam,
    classPrefix: 'horse',
    description: 'Driving business development, strategic partnerships, and client operations.',
    gemstoneColor: 'green'
  }
];

export const LapisCardHand: React.FC = () => {
  const [activeCard, setActiveCard] = useState<string | null>(null);

  // Close zoomed card when clicking outside or anywhere on the layout
  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveCard(null);
    };
    if (activeCard) {
      window.addEventListener('click', handleOutsideClick);
    }
    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, [activeCard]);

  const handleCardClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Toggle active card
    setActiveCard(prev => prev === id ? null : id);
  };

  return (
    <div className="lapis-hand-container">
      <main className="hand">
        {/* original cards */}
        {members.map(member => {
          const isHidden = activeCard !== null;
          return (
            <section
              key={`orig-${member.id}`}
              className={`hand__${member.classPrefix} card-origin ${isHidden ? 'card--hidden' : ''}`}
              onClick={(e) => handleCardClick(member.id, e)}
            >
              <article
                className={`hand__${member.classPrefix}__article`}
                style={{
                  backgroundImage: `url(${member.avatarUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  backgroundColor: '#111'
                }}
              >
                <div className="card-inner-info">
                  <span className="card-tag">{member.gemstoneColor.toUpperCase()}</span>
                </div>
              </article>
              <aside className={`hand__${member.classPrefix}__aside`}>
                <div className="card-aside-content">
                  <h4 className="card-aside-name">{member.name}</h4>
                  <p className="card-aside-title">{member.title}</p>
                </div>
              </aside>
            </section>
          );
        })}

        {/* transparent curtain */}
        <article
          className={`hand__curtain ${activeCard ? 'curtain--visible' : ''}`}
          onClick={() => setActiveCard(null)}
        />

        {/* clone cards */}
        {members.map(member => {
          const isVisible = activeCard === member.id;
          return (
            <section
              key={`clone-${member.id}`}
              className={`hand__${member.classPrefix}-clone card-clone ${isVisible ? 'card--visible' : ''}`}
              onClick={() => setActiveCard(null)}
            >
              <article
                className={`hand__${member.classPrefix}-clone__article`}
                style={{
                  backgroundImage: `url(${member.avatarUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  backgroundColor: '#111'
                }}
              >
                <span className={`hand__${member.classPrefix}-clone__article__span ${member.classPrefix}-clone-vfx ${isVisible ? 'vfx--visible' : ''}`}></span>
                <div className="card-inner-info-clone">
                  <span className="card-tag">{member.gemstoneColor.toUpperCase()}</span>
                </div>
              </article>
              <aside className={`hand__${member.classPrefix}-clone__aside`}>
                <div className="card-aside-content-clone">
                  <h4 className="card-aside-name-clone">{member.name}</h4>
                  <p className="card-aside-title-clone">{member.title}</p>
                  <p className="card-aside-desc-clone">{member.description}</p>
                </div>
              </aside>
            </section>
          );
        })}
      </main>
    </div>
  );
};

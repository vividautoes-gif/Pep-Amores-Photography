'use client';
import React from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Facebook, Camera, Instagram, Linkedin, ExternalLink } from 'lucide-react';

interface FooterLink {
	title: string;
	href?: string;
	onClick?: () => void;
	icon?: React.ComponentType<{ className?: string }>;
    iconHoverClass?: string;
    textHoverClass?: string;
}

interface FooterSection {
	label: string;
	links: FooterLink[];
}

export function Footer({ onNavigate, lang }: { onNavigate: (id: string) => void, lang: 'es' | 'en' | 'ca' }) {
    const t = {
        nav: { es: 'Navegación', en: 'Navigation', ca: 'Navegació' },
        home: { es: 'Inicio', en: 'Home', ca: 'Inici' },
        journeys: { es: 'Viajes', en: 'Journeys', ca: 'Viatges' },
        explore: { es: 'Explorar', en: 'Explore', ca: 'Explorar' },
        favorites: { es: 'Favoritos', en: 'Favorites', ca: 'Preferits' },
        collections: { es: 'Colecciones', en: 'Collections', ca: 'Col·leccions' },
        aboutLabel: { es: 'Sobre mí', en: 'About', ca: 'Sobre mi' },
        movies: { es: 'Mis Películas', en: 'My Movies', ca: 'Les meves pel·lícules' },
        about: { es: 'Biografía', en: 'About', ca: 'Biografia' },
        contact: { es: 'Contacto', en: 'Contact', ca: 'Contacte' },
        social: { es: 'Redes Sociales', en: 'Social Links', ca: 'Xarxes Socials' },
        rights: { es: 'Todos los derechos reservados.', en: 'All rights reserved.', ca: 'Tots els drets reservats.' }
    };
    
    const footerLinks: FooterSection[] = [
        {
            label: t.nav[lang],
            links: [
                { title: t.home[lang], onClick: () => onNavigate('home') },
                { title: t.journeys[lang], onClick: () => onNavigate('journeys') },
                { title: t.explore[lang], onClick: () => onNavigate('explore') },
                { title: t.favorites[lang], onClick: () => onNavigate('favorites') },
            ],
        },
        {
            label: t.collections[lang],
            links: [
                { title: lang === 'es' ? 'Últimas 50' : lang === 'ca' ? 'Últimes 50' : 'Latest 50', onClick: () => onNavigate('latest') },
                { title: 'LFI Gallery', onClick: () => onNavigate('lfi') },
            ],
        },
        {
            label: t.aboutLabel[lang],
            links: [
                { title: t.movies[lang], onClick: () => onNavigate('my-movies') },
                { title: t.about[lang], onClick: () => onNavigate('about') },
                { title: t.contact[lang], onClick: () => onNavigate('contact') },
            ],
        },
        {
            label: t.social[lang],
            links: [
                { 
                    title: 'Instagram', 
                    href: 'https://www.instagram.com/pepamores?igsh=dGp3ODZxaWdqcnd0', 
                    icon: Instagram,
                    iconHoverClass: 'group-hover:text-[#E1306C]',
                    textHoverClass: 'group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-tr group-hover:from-[#f09433] group-hover:via-[#dc2743] group-hover:to-[#bc1888]'
                },
                { 
                    title: 'LinkedIn', 
                    href: 'https://www.linkedin.com/in/josepamores?utm_source=share_via&utm_content=profile&utm_medium=member_ios', 
                    icon: Linkedin,
                    iconHoverClass: 'group-hover:text-[#0A66C2]',
                    textHoverClass: 'group-hover:text-[#0A66C2]'
                },
                { 
                    title: 'LFI Online (External)', 
                    href: 'https://lfi-online.de/en/gallery/Pep-Amores-874174.html', 
                    icon: ExternalLink,
                    iconHoverClass: 'group-hover:text-blue-400',
                    textHoverClass: 'group-hover:text-blue-400'
                },
                { 
                    title: 'IMDb', 
                    href: 'https://www.imdb.com/name/nm10620703/?ref_=ext_shr_lnk', 
                    icon: ExternalLink,
                    iconHoverClass: 'group-hover:text-yellow-400',
                    textHoverClass: 'group-hover:text-yellow-400'
                },
            ],
        },
    ];

	return (
		<footer className="md:rounded-t-6xl relative w-full flex flex-col items-center justify-center rounded-t-4xl border-t border-white/10 bg-slate-950 px-6 pt-12 pb-[calc(3rem+env(safe-area-inset-bottom))] lg:py-16 mt-24 overflow-hidden">
			<div className="bg-brand-accent/30 absolute top-0 right-1/2 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full blur-md" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-[radial-gradient(ellipse_at_top,rgba(180,83,9,0.2),transparent_70%)] pointer-events-none" />

			<div className="grid w-full max-w-6xl gap-8 xl:grid-cols-3 xl:gap-8 relative z-10">
				<AnimatedContainer className="space-y-4">
					<div className="flex items-center gap-3 group cursor-pointer" onClick={() => onNavigate('home')}>
                        <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center text-white transition-transform group-hover:rotate-12 group-hover:bg-brand-accent">
                            <Camera size={20} />
                        </div>
                        <span className="text-xl font-extrabold tracking-tighter uppercase text-white">Pep Amores</span>
                    </div>
				</AnimatedContainer>

				<div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4 xl:col-span-2 xl:mt-0">
					{footerLinks.map((section, index) => (
						<AnimatedContainer key={section.label} delay={0.1 + index * 0.1}>
							<div className="mb-10 md:mb-0">
								<h3 className="text-xs font-bold uppercase tracking-widest text-brand-accent">{section.label}</h3>
								<ul className="text-white/60 mt-4 space-y-2 text-sm">
									{section.links.map((link) => {
                                        const iconClass = link.iconHoverClass || 'group-hover:text-brand-accent';
                                        const textClass = link.textHoverClass || 'group-hover:text-brand-accent';
                                        
                                        return (
										<li key={link.title}>
											{link.href ? (
                                                <a
                                                    href={link.href}
                                                    target={link.href.startsWith('http') ? '_blank' : undefined}
                                                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                                    className="group inline-flex items-center transition-all duration-300 cursor-pointer"
                                                >
                                                    {link.icon && <link.icon className={`me-2 size-4 transition-colors duration-300 ${iconClass}`} />}
                                                    <span className={`transition-all duration-300 ${textClass}`}>{link.title}</span>
                                                </a>
                                            ) : (
                                                <button
                                                    onClick={link.onClick}
                                                    className="group inline-flex items-center transition-all duration-300 cursor-pointer text-left"
                                                >
                                                    {link.icon && <link.icon className={`me-2 size-4 transition-colors duration-300 ${iconClass}`} />}
                                                    <span className={`transition-all duration-300 ${textClass}`}>{link.title}</span>
                                                </button>
                                            )}
										</li>
									)})}
								</ul>
							</div>
						</AnimatedContainer>
					))}
				</div>
			</div>

            <div className="w-full max-w-6xl relative z-10 mt-16 pt-8 border-t border-white/10 flex flex-col items-center justify-center">
                <p className="text-white/40 text-sm text-center">
                    © {new Date().getFullYear()} Pep Amores. {t.rights[lang]}
                </p>
            </div>
		</footer>
	);
};

type ViewAnimationProps = {
	delay?: number;
	className?: ComponentProps<typeof motion.div>['className'];
	children: ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
	const shouldReduceMotion = useReducedMotion();

	if (shouldReduceMotion) {
		return children;
	}

	return (
		<motion.div
			initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
			whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
			viewport={{ once: true }}
			transition={{ delay, duration: 0.8 }}
			className={className}
		>
			{children}
		</motion.div>
	);
}

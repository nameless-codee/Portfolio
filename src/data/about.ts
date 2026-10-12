export type AboutBlockId = "about" | "experience" | "skills";

/** Placeholder copy – replace with your own. Keep each body to a few sentences; the layout
 *  engine shrinks the type to fit, but very long text ends up small. */
export const ABOUT_COPY: Record<AboutBlockId, { title: string; body: string }> =
	{
		about: {
			title: "About Me",
			body: "I'm a Software Engineering undergraduate at SLIIT with a passion for building modern, \
      intuitive, and impactful digital experiences. Since beginning my programming journey in 2020, \
      I've explored frontend and full-stack development, UI/UX design, and software engineering, \
      turning ideas into practical solutions through code and creativity. Beyond development, \
      I enjoy exploring new ideas, creating digital designs, and experimenting with technology. \
      I'm always eager to learn, collaborate, and build meaningful projects that combine thoughtful \
      design with solid engineering.",
		},
		experience: {
			title: "Experience",
			body: "Software Engineering Intern at Ciftron. Editorial team lead on the IEEE Industry 360 Cast \
      project with SLIIT IEEE IAS. Built Evenza, an event planning web app, and an ML project \
      predicting NASDAQ stock price trends.",
		},
		skills: {
			title: "Skills",
			body: "My skill set combines software development, modern frontend technologies, \
      and creative design. I enjoy building responsive, user-friendly web experiences that \
      bring together functionality, aesthetics, and thoughtful design. From developing \
      interactive interfaces to exploring full-stack development, I’m always eager to expand \
      my technical knowledge and experiment with new tools and technologies. I also have a strong \
      interest in UI/UX design, graphic design, artificial intelligence, and game development. \
      I enjoy transforming ideas into practical, visually engaging digital products while \
      continuously learning, solving problems, and exploring new possibilities through \
      technology and creativity.",
		},
	};

/** Order used by the stacked (mobile) layout. */
export const ABOUT_ORDER: AboutBlockId[] = ["about", "skills", "experience"];

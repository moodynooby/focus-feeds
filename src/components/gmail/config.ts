interface GmailApp {
	name: string;
	url: string;
	icon: string;
}

export const GMAIL_APPS: GmailApp[] = [
	{ name: "Fmail", url: "https://fmail.vercel.app", icon: "✉️" },
	{ name: "F Tasks", url: "https://todotxt.netlify.app/", icon: "✔️" },
];

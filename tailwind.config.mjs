/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px",
			},
		},
		extend: {
			colors: {
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			fontFamily: {
				sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
				display: ["Instrument Serif", "Iowan Old Style", "Georgia", "serif"],
				mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
			},
			typography: ({ theme }) => ({
				DEFAULT: {
					css: {
						"--tw-prose-body": "hsl(var(--foreground) / 0.85)",
						"--tw-prose-headings": "hsl(var(--foreground))",
						"--tw-prose-links": "hsl(var(--accent))",
						"--tw-prose-bold": "hsl(var(--foreground))",
						"--tw-prose-quotes": "hsl(var(--muted-foreground))",
						"--tw-prose-quote-borders": "hsl(var(--accent))",
						"--tw-prose-code": "hsl(var(--foreground))",
						"--tw-prose-pre-bg": "hsl(var(--secondary))",
						"--tw-prose-pre-code": "hsl(var(--foreground))",
						"--tw-prose-hr": "hsl(var(--border))",
						"--tw-prose-th-borders": "hsl(var(--border))",
						"--tw-prose-td-borders": "hsl(var(--border))",
						"--tw-prose-counters": "hsl(var(--muted-foreground))",
						"--tw-prose-bullets": "hsl(var(--muted-foreground))",
						maxWidth: "none",
						"h1, h2, h3": { fontFamily: theme("fontFamily.display").join(", "), fontWeight: "400" },
						a: { textDecoration: "none", borderBottom: "1px solid hsl(var(--accent) / 0.4)" },
						"a:hover": { borderBottomColor: "hsl(var(--accent))" },
					},
				},
			}),
			keyframes: {
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
			},
		},
	},
	plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};

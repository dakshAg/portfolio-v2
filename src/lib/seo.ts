export const SITE_URL = "https://dakshagrawalx.com";
export const SITE_NAME = "Daksh Agrawal";
export const SITE_DESCRIPTION =
	"Daksh Agrawal (also spelled Agarwal) is an AI Engineer, Data Engineer, Data Scientist and Data Analyst based in Melbourne, Australia and Udaipur, India.";

const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export const personRef = { "@id": PERSON_ID };

// Common misspellings of "Agrawal", so search engines tie them to this page
const NAME_VARIANTS = [
	"Daksh Agarwal",
	"Daksh Aggarwal",
	"Daksh Agrawaal",
	"Daksh Aggrawal",
	"Daksh Agarwaal",
	"Daksh Agerwal",
];

const person = {
	"@type": "Person",
	"@id": PERSON_ID,
	name: "Daksh Agrawal",
	alternateName: NAME_VARIANTS,
	givenName: "Daksh",
	familyName: "Agrawal",
	url: `${SITE_URL}/`,
	image: `${SITE_URL}/images/hero-avatar.png`,
	email: "mailto:dakshagrawalx@gmail.com",
	jobTitle: ["AI Engineer", "Data Engineer", "Data Scientist", "Data Analyst"],
	description: SITE_DESCRIPTION,
	homeLocation: [
		{
			"@type": "Place",
			name: "Melbourne, Australia",
			address: {
				"@type": "PostalAddress",
				addressLocality: "Melbourne",
				addressRegion: "VIC",
				addressCountry: "AU",
			},
		},
		{
			"@type": "Place",
			name: "Udaipur, India",
			address: {
				"@type": "PostalAddress",
				addressLocality: "Udaipur",
				addressRegion: "Rajasthan",
				addressCountry: "IN",
			},
		},
	],
	alumniOf: {
		"@type": "CollegeOrUniversity",
		name: "The University of Melbourne",
		sameAs: "https://en.wikipedia.org/wiki/University_of_Melbourne",
	},
	hasCredential: {
		"@type": "EducationalOccupationalCredential",
		credentialCategory: "degree",
		name: "Bachelor of Science (Data Science), First Class Honours",
	},
	knowsAbout: [
		"Artificial Intelligence",
		"AI Engineering",
		"Large Language Models",
		"Machine Learning",
		"Data Engineering",
		"Data Pipelines",
		"Data Science",
		"Data Analysis",
		"Quantitative Finance",
		"Python",
		"SQL",
		"PySpark",
		"PyTorch",
		"FastAPI",
	],
	sameAs: [
		"https://www.linkedin.com/in/daksh-agrawal/",
		"https://github.com/dakshAg",
		"https://dakshagrawal.substack.com/",
	],
};

const website = {
	"@type": "WebSite",
	"@id": WEBSITE_ID,
	url: `${SITE_URL}/`,
	name: SITE_NAME,
	inLanguage: "en",
	about: personRef,
	publisher: personRef,
};

export function jsonLdGraph(extra: Record<string, unknown>[] = []) {
	return {
		"@context": "https://schema.org",
		"@graph": [person, website, ...extra],
	};
}

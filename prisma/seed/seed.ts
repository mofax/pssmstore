import { prisma } from "../prisma-client";
import { Prisma } from "../generated/client";
import { randomHex } from "../../app-common/random";
import { hashPassword } from "../../appserver/utilities/password";

type Secret = {
	key: string;
	value: string;
};

type Page = {
	name: string;
	environments?: string[];
	secrets: Secret[];
};

type Folder = {
	name: string;
	pages: Page[];
};

const seedData: Folder[] = [
	{
		name: "Work",
		pages: [
			{
				name: "API Keys",
				environments: ["dev", "staging", "prod"],
				secrets: [
					{ key: "stripe_api_key", value: "sk_test_example" },
					{ key: "aws_access_key", value: "AKIAIOSFODNN7EXAMPLE" },
					{
						key: "aws_secret_key",
						value: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
					},
				],
			},
			{
				name: "Database Credentials",
				environments: ["dev", "staging", "prod"],
				secrets: [
					{ key: "db_host", value: "localhost" },
					{ key: "db_user", value: "admin" },
					{ key: "db_password", value: "secret123" },
					{ key: "db_port", value: "5432" },
				],
			},
			{
				name: "Email Service",
				environments: ["dev", "prod"],
				secrets: [
					{ key: "smtp_host", value: "smtp.example.com" },
					{ key: "smtp_user", value: "noreply@example.com" },
					{ key: "smtp_password", value: "email_password_123" },
				],
			},
		],
	},
	{
		name: "Personal",
		pages: [
			{
				name: "Email Accounts",
				secrets: [
					{ key: "gmail", value: "user@gmail.com" },
					{ key: "outlook", value: "user@outlook.com" },
				],
			},
			{
				name: "Social Media",
				secrets: [
					{ key: "twitter_api_key", value: "twitter_key_example" },
					{ key: "twitter_api_secret", value: "twitter_secret_example" },
				],
			},
		],
	},
	{
		name: "Projects",
		pages: [
			{
				name: "GitHub Tokens",
				environments: ["dev", "prod"],
				secrets: [
					{ key: "github_personal_token", value: "ghp_example_token" },
					{ key: "github_org_token", value: "gho_example_org_token" },
				],
			},
			{
				name: "Docker Registry",
				environments: ["dev", "staging", "prod"],
				secrets: [
					{ key: "registry_url", value: "registry.example.com" },
					{ key: "registry_user", value: "docker_user" },
					{ key: "registry_password", value: "docker_password" },
				],
			},
		],
	},
	{
		name: "Cloud Services",
		pages: [
			{
				name: "AWS Credentials",
				environments: ["dev", "staging", "prod"],
				secrets: [
					{ key: "aws_region", value: "us-east-1" },
					{ key: "aws_access_key_id", value: "AKIAIOSFODNN7EXAMPLE" },
					{
						key: "aws_secret_access_key",
						value: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
					},
					{ key: "aws_session_token", value: "session_token_example" },
				],
			},
			{
				name: "Azure Credentials",
				environments: ["dev", "prod"],
				secrets: [
					{ key: "azure_tenant_id", value: "tenant_id_example" },
					{ key: "azure_client_id", value: "client_id_example" },
					{ key: "azure_client_secret", value: "client_secret_example" },
				],
			},
			{
				name: "GCP Credentials",
				environments: ["dev", "staging", "prod"],
				secrets: [
					{ key: "gcp_project_id", value: "project_id_example" },
					{ key: "gcp_service_account", value: "service_account_example" },
					{ key: "gcp_key_file", value: "key_file_path_example" },
				],
			},
		],
	},
	{
		name: "Payment Gateways",
		pages: [
			{
				name: "Stripe",
				environments: ["dev", "staging", "prod"],
				secrets: [
					{ key: "stripe_publishable_key", value: "pk_test_example" },
					{ key: "stripe_secret_key", value: "sk_test_example" },
					{ key: "stripe_webhook_secret", value: "whsec_example" },
				],
			},
			{
				name: "PayPal",
				environments: ["dev", "prod"],
				secrets: [
					{ key: "paypal_client_id", value: "client_id_example" },
					{ key: "paypal_client_secret", value: "client_secret_example" },
					{ key: "paypal_mode", value: "sandbox" },
				],
			},
		],
	},
	{
		name: "Monitoring & Analytics",
		pages: [
			{
				name: "Datadog",
				environments: ["dev", "staging", "prod"],
				secrets: [
					{ key: "datadog_api_key", value: "api_key_example" },
					{ key: "datadog_app_key", value: "app_key_example" },
				],
			},
			{
				name: "Sentry",
				environments: ["dev", "prod"],
				secrets: [
					{ key: "sentry_dsn", value: "https://example@sentry.io/123456" },
					{ key: "sentry_auth_token", value: "auth_token_example" },
				],
			},
			{
				name: "New Relic",
				environments: ["prod"],
				secrets: [
					{ key: "newrelic_license_key", value: "license_key_example" },
					{ key: "newrelic_api_key", value: "api_key_example" },
				],
			},
		],
	},
	{
		name: "Communication Services",
		pages: [
			{
				name: "Twilio",
				environments: ["dev", "prod"],
				secrets: [
					{ key: "twilio_account_sid", value: "AC_example" },
					{ key: "twilio_auth_token", value: "auth_token_example" },
					{ key: "twilio_phone_number", value: "+1234567890" },
				],
			},
			{
				name: "SendGrid",
				environments: ["dev", "staging", "prod"],
				secrets: [
					{ key: "sendgrid_api_key", value: "SG_example" },
					{ key: "sendgrid_from_email", value: "noreply@example.com" },
				],
			},
			{
				name: "Slack",
				secrets: [
					{ key: "slack_bot_token", value: "xoxb_example" },
					{
						key: "slack_webhook_url",
						value: "https://hooks.slack.com/services/example",
					},
				],
			},
		],
	},
	{
		name: "Storage & CDN",
		pages: [
			{
				name: "S3 Buckets",
				environments: ["dev", "staging", "prod"],
				secrets: [
					{ key: "s3_bucket_name", value: "bucket_name_example" },
					{ key: "s3_access_key", value: "access_key_example" },
					{ key: "s3_secret_key", value: "secret_key_example" },
					{ key: "s3_region", value: "us-east-1" },
				],
			},
			{
				name: "CloudFront",
				environments: ["prod"],
				secrets: [
					{
						key: "cloudfront_distribution_id",
						value: "distribution_id_example",
					},
					{ key: "cloudfront_key_pair_id", value: "key_pair_id_example" },
				],
			},
		],
	},
	{
		name: "Third-Party APIs",
		pages: [
			{
				name: "OpenAI",
				environments: ["dev", "prod"],
				secrets: [
					{ key: "openai_api_key", value: "sk-example" },
					{ key: "openai_org_id", value: "org_example" },
				],
			},
			{
				name: "Google Maps",
				environments: ["dev", "prod"],
				secrets: [
					{ key: "google_maps_api_key", value: "AIza_example" },
					{ key: "google_maps_client_id", value: "client_id_example" },
				],
			},
			{
				name: "Firebase",
				environments: ["dev", "staging", "prod"],
				secrets: [
					{ key: "firebase_api_key", value: "api_key_example" },
					{ key: "firebase_project_id", value: "project_id_example" },
					{ key: "firebase_messaging_sender_id", value: "sender_id_example" },
				],
			},
		],
	},
	{
		name: "Security & Auth",
		pages: [
			{
				name: "JWT Secrets",
				environments: ["dev", "staging", "prod"],
				secrets: [
					{ key: "jwt_secret", value: "jwt_secret_example" },
					{ key: "jwt_refresh_secret", value: "jwt_refresh_secret_example" },
					{ key: "jwt_expires_in", value: "3600" },
				],
			},
			{
				name: "OAuth Providers",
				environments: ["dev", "prod"],
				secrets: [
					{ key: "google_client_id", value: "client_id_example" },
					{ key: "google_client_secret", value: "client_secret_example" },
					{ key: "github_client_id", value: "client_id_example" },
					{ key: "github_client_secret", value: "client_secret_example" },
				],
			},
			{
				name: "API Security",
				environments: ["dev", "staging", "prod"],
				secrets: [
					{ key: "api_rate_limit_key", value: "rate_limit_key_example" },
					{ key: "encryption_key", value: "encryption_key_example" },
				],
			},
		],
	},
];

const identities = [
	{
		username: "alloys",
		email: "alloys@example.com",
		password: "password123",
	},
];

async function main() {
	console.log("Starting seed...");

	// Clear existing data
	console.log("Clearing existing data...");
	await prisma.$executeRaw`DELETE FROM secrets`;
	await prisma.pages.deleteMany();
	await prisma.folders.deleteMany();
	await prisma.identities.deleteMany();

	// Seed identities
	console.log("Seeding identities...");
	for (const identity of identities) {
		const hashedPassword = await hashPassword(identity.password);
		await prisma.identities.create({
			data: {
				id: randomHex(),
				username: identity.username,
				email: identity.email,
				password: hashedPassword,
			},
		});
	}

	// Seed folders with pages and secrets
	console.log("Seeding folders, pages, and secrets...");
	for (const folderData of seedData) {
		const folder = await prisma.folders.create({
			data: {
				id: randomHex(),
				name: folderData.name,
			},
		});

		for (const pageData of folderData.pages) {
			const environments = pageData.environments || [null];

			for (const env of environments) {
				const pageName = env ? `${pageData.name} (${env})` : pageData.name;
				const page = await prisma.pages.create({
					data: {
						id: randomHex(),
						name: pageName,
						folder_id: folder.id,
					},
				});

				// Seed secrets for this page
				for (const secret of pageData.secrets) {
					// Adjust secret values based on environment
					const secretValue = env
						? secret.value.replace("example", `${env}_example`)
						: secret.value;

					await prisma.secrets.create({
						data: {
							id: randomHex(),
							page_id: page.id,
							key: secret.key,
							value: secretValue,
						},
					});
				}
			}
		}
	}

	console.log("Seed completed successfully!");
}

main()
	.catch((e) => {
		console.error("Error during seed:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

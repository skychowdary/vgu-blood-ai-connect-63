# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/8bbb400b-292a-4a90-8022-9988bd2ce8fc

## Configuration

This project requires environment variables to be set before it can function properly.

### Setting Environment Variables in Lovable

1. Go to your Lovable project
2. Click on **Project** → **Environment Variables**
3. Set variables for both **Preview** and **Production** environments
4. After setting variables, rebuild and hard refresh your app

### Required Environment Variables

Set the following environment variables with your actual values:

- **VITE_SUPABASE_URL** - Your Supabase project URL (e.g., `https://your-project.supabase.co`)
- **VITE_SUPABASE_ANON_KEY** - Your Supabase anonymous/public key
- **VITE_WA_COORDINATOR** - WhatsApp number for emergency coordinator (e.g., `919123456789`)
- **VITE_WA_COMMUNITY_LINK** - WhatsApp community group invite link
- **VITE_AI_CHAT_ENDPOINT** - Your AI chat service endpoint URL
- **VITE_ADMIN_EMAIL** - Admin login email address
- **VITE_ADMIN_PASSWORD** - Admin login password
- **VITE_APP_NAME** - Application name (optional, defaults to "VGU Blood Finder AI")
- **VITE_APP_LOGO** - Application logo URL (optional, has default)

### Local Development

For local development, you can create a `.env` file in the project root with these variables. See `.env.example` for the format.

**Note**: After setting environment variables, you must rebuild and hard refresh the app for changes to take effect.

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/8bbb400b-292a-4a90-8022-9988bd2ce8fc) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/8bbb400b-292a-4a90-8022-9988bd2ce8fc) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

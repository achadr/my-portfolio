# Achraf BOUGATTAYA - Portfolio

A modern, animated portfolio website built with Next.js 15, React 18, TypeScript, and Tailwind CSS.

## Features

- ✨ Smooth scroll animations with Framer Motion
- 📧 Working contact form with Resend email service
- 🎨 Responsive design with Tailwind CSS
- ⚡ Optimized performance with Next.js
- 🔍 SEO-friendly with Open Graph tags
- ♿ Accessible with ARIA labels
- 📱 Mobile-first responsive design

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Email**: Resend
- **Icons**: React Icons
- **Toast Notifications**: react-hot-toast

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Resend account for email functionality

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
RESEND_API_KEY=your_resend_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [Vercel](https://vercel.com) and import your repository
3. Add environment variable: `RESEND_API_KEY`
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `RESEND_API_KEY` | API key from Resend for sending emails | Yes |

## Customization

### Update Your Information

Edit `lib/data.ts` to customize:
- Navigation links
- Experience timeline
- Projects showcase
- Skills list

### Update Contact Email

Change the recipient email in `src/actions/sendEmail.ts`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Contact

Achraf BOUGATTAYA - [bougattaya.achraf@gmail.com](mailto:bougattaya.achraf@gmail.com)

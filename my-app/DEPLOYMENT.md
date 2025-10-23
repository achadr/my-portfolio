# Deployment Checklist

Use this checklist before deploying your portfolio to production.

## Pre-Deployment Checklist

### ✅ Content Review
- [ ] Update projects in `lib/data.ts` with your actual projects
- [ ] Replace placeholder project images in `/public` folder
- [ ] Verify experience timeline is accurate
- [ ] Check skills list is up to date
- [ ] Update CV file in `/public/CV_BOUGATTAYA_Achraf.pdf`
- [ ] Verify LinkedIn and GitHub URLs in `intro.tsx`
- [ ] Test all navigation links work correctly

### ✅ Configuration
- [ ] Update `robots.txt` sitemap URL with your actual domain
- [ ] Verify email recipient in `src/actions/sendEmail.ts` is correct
- [ ] Test contact form sends emails successfully
- [ ] Update Open Graph URL in `layout.tsx` metadata with your domain

### ✅ Assets
- [ ] Optimize all images (compress, resize)
- [ ] Add custom favicon (replace `src/app/icon.svg` if desired)
- [ ] Add custom Open Graph image (replace `src/app/opengraph-image.svg`)
- [ ] Verify all image alt texts are descriptive

### ✅ Environment Variables
- [ ] Create `.env.local` file locally (never commit this!)
- [ ] Set up `RESEND_API_KEY` in deployment platform
- [ ] Verify Resend account has verified email address
- [ ] Test email delivery works

### ✅ Testing
- [ ] Run `npm run build` locally to check for errors
- [ ] Test all sections load correctly
- [ ] Test mobile responsiveness
- [ ] Test contact form submission
- [ ] Check browser console for errors
- [ ] Test all animations work smoothly
- [ ] Verify loading performance

### ✅ SEO & Analytics (Optional)
- [ ] Add Google Analytics tracking code
- [ ] Submit sitemap to Google Search Console
- [ ] Add structured data (Schema.org)
- [ ] Test social media preview cards

## Deployment Steps

### Option 1: Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**
   - Go to Project Settings > Environment Variables
   - Add: `RESEND_API_KEY` = your_api_key

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your site will be live at `your-project.vercel.app`

5. **Custom Domain (Optional)**
   - Go to Project Settings > Domains
   - Add your custom domain
   - Update DNS records as instructed

### Option 2: Netlify

1. **Build Configuration**
   - Build command: `npm run build`
   - Publish directory: `.next`

2. **Deploy**
   - Connect GitHub repository
   - Add environment variables
   - Deploy

## Post-Deployment

- [ ] Test live site thoroughly
- [ ] Check email delivery on production
- [ ] Verify custom domain works (if applicable)
- [ ] Submit to Google Search Console
- [ ] Share on LinkedIn, Twitter, etc.
- [ ] Monitor performance with Lighthouse
- [ ] Set up error monitoring (Sentry, etc.)

## Common Issues

**Contact form not working?**
- Check `RESEND_API_KEY` is set in deployment platform
- Verify recipient email is verified in Resend
- Check deployment logs for errors

**Images not loading?**
- Verify image paths are correct
- Check image files exist in `/public` folder
- Ensure image optimization is working

**Build failing?**
- Run `npm run build` locally first
- Check TypeScript errors
- Verify all imports are correct

## Maintenance

- Regularly update dependencies: `npm update`
- Monitor security vulnerabilities: `npm audit`
- Keep content fresh (update projects, experience)
- Respond to contact form submissions promptly

---

**Ready to deploy?** Double-check everything above and go for it! 🚀

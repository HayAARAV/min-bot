
GYK CRYPTO MINING PLATFORM - INSTALLATION GUIDE
-----------------------------------------------

1. PREREQUISITES:
- Node.js (v18 or higher)
- A Telegram Bot (via @BotFather)
- Adsgram Account (for monetization)
- TON Wallet (for test withdrawals)

2. TELEGRAM BOT SETUP:
- Create a bot in @BotFather.
- Copy your API Token.
- Set up a Mini App link pointing to your hosted URL.

3. ADSGRAM SETUP:
- Create an account on Adsgram.
- Create a new 'Block' for reward-based ads.
- Get your Block ID/Token and update it in the Admin Settings.

4. LOCALHOST INSTALLATION (Frontend):
- Open terminal in project root.
- Run `npm install`.
- Run `npm start`.
- Access via http://localhost:3000.

5. SERVER DEPLOYMENT:
- Build the project using `npm run build`.
- Upload the `dist` folder to your static hosting (Vercel, Netlify, or Apache).
- Ensure your SSL certificate is active (Telegram Mini Apps require HTTPS).

6. SECURITY NOTES:
- The mining logic is calculated based on GMT timestamps.
- All forms are sanitized on input.
- Referral IP checking is implemented to prevent multiple registrations from the same device.
- For Production MERN: Ensure you connect to MongoDB Atlas and provide the URI in your .env file.

7. ADMIN ACCESS:
- The demo version includes a toggle button in the bottom navigation.
- In production, restrict the `/admin` route with password-protected authentication.

CONTACT SUPPORT:
- Telegram: https://t.me/gyk_mining

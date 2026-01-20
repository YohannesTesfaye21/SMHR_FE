# Somalia Master Health Facility Registry (SMHFR)

The **Somalia Master Health Facility Registry (SMHFR)** is a modern, web-based platform designed to centralize, manage, and visualize health facility data across Somalia. It provides stakeholders with a reliable source of truth for health infrastructure, enabling better planning, resource allocation, and healthcare delivery.

## 🚀 Key Features

-   **Interactive Dashboard**: Real-time visualization of health facility statistics across different states and regions.
-   **Advanced Filtering**: Powerful search and filter capabilities to find facilities by state, region, type, and ownership.
-   **Interactive Map**: A geospatial view of health facilities using interactive markers and popups for detailed information.
-   **Detailed Profiles**: Comprehensive information for each health facility, including contact details, services, and locations.
-   **Responsive Design**: A premium, "world-class" user interface optimized for both desktop and mobile devices.

## 🛠️ Tech Stack

-   **Frontend**: [Next.js](https://nextjs.org/) (React), [TypeScript](https://www.typescriptlang.org/)
-   **Mapping**: [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/)
-   **Styling**: Modern Vanilla CSS, [Lucide React](https://lucide.dev/) (Icons)
-   **Data Visualization**: Custom SVG-based dashboards and charts.

## 🏁 Getting Started

### Prerequisites

-   Node.js (v18 or later)
-   npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/zolamars/SMHFR_WEB.git
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```

## 🚀 Vercel Deployment

### Required Environment Variables

Configure these in your Vercel project settings (**Settings** → **Environment Variables**):

1. **`NODE_TLS_REJECT_UNAUTHORIZED`** (Required for HTTPS with self-signed certificates)
   - Value: `0`
   - **Critical**: Must be set in Vercel dashboard (cannot be set at runtime)
   - Allows connections to backends with self-signed certificates

2. **`BACKEND_API_URL`** (Optional but recommended)
   - Value: Your backend API URL
   - Example: `https://144.91.86.199:8443`
   - If not set, defaults to `https://144.91.86.199:8443` (always HTTPS)

### Deployment Steps

1. **Set Environment Variables in Vercel:**
   - Go to your Vercel project dashboard
   - Navigate to **Settings** → **Environment Variables**
   - Add:
     - `NODE_TLS_REJECT_UNAUTHORIZED` = `0`
     - `BACKEND_API_URL` = `https://your-backend-url:port` (optional)

2. **Deploy:**
   ```bash
   git push origin main
   ```
   Or connect your repository to Vercel for automatic deployments.

3. **Verify Configuration:**
   - After deployment, visit: `https://your-app.vercel.app/api/debug`
   - This endpoint shows your current configuration
   - Check that `nodeTlsRejectUnauthorized` is set to `0`
   - Verify `backendApiUrl` points to the correct backend

### Important Notes

- **HTTPS Required**: Vercel blocks HTTP connections to external IPs. Your backend must use HTTPS.
- **Self-Signed Certificates**: If your backend uses a self-signed certificate, `NODE_TLS_REJECT_UNAUTHORIZED=0` is mandatory.
- **Local Development**: HTTP works fine locally, but Vercel requires HTTPS.
- **Timeout**: API requests have a 30-second timeout.

### Troubleshooting

If API calls fail on Vercel:

1. **Check Configuration:**
   - Visit `/api/debug` endpoint to verify environment variables
   - Ensure `NODE_TLS_REJECT_UNAUTHORIZED=0` is set

2. **Check Vercel Logs:**
   - Go to Vercel dashboard → **Deployments** → Select deployment → **Functions** tab
   - Look for error messages in function logs

3. **Common Issues:**
   - **Certificate errors**: Ensure `NODE_TLS_REJECT_UNAUTHORIZED=0` is set
   - **Connection refused**: Verify backend is accessible from Vercel's network (check firewall)
   - **Timeout**: Backend may be slow or unreachable (30s timeout)
   - **DNS errors**: Verify `BACKEND_API_URL` is correct

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

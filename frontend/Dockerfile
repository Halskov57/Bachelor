# --- STAGE 1: Build the React Application ---
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package.json package-lock.json ./
# Install dependencies
RUN npm install

# Copy all remaining application files, including the nginx.conf
COPY . .

# Create the production build, which generates static files in the 'build' folder
RUN npm run build

# --- STAGE 2: Serve the Static Assets using Nginx with Reverse Proxy ---
# We use a lightweight web server to serve the static assets efficiently
FROM nginx:stable-alpine
# Copy the built assets from the 'build' stage into Nginx's public folder
COPY --from=build /app/build /usr/share/nginx/html

# *** MODIFICATION: Copy the custom Nginx configuration ***
# This is the file that contains the 'proxy_pass' directive 
# to route /api/ requests to the backend.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the standard Nginx port
EXPOSE 80

# The container will run Nginx to serve the site
CMD ["nginx", "-g", "daemon off;"]
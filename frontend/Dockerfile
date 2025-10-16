# --- STAGE 1: Build the React Application ---
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package.json package-lock.json ./
# Install dependencies
RUN npm install

# Copy all remaining application files
COPY . .

# Create the production build, which generates static files in the 'build' folder
RUN npm run build

# --- STAGE 2: Serve the Static Assets using Nginx ---
# We use a lightweight web server to serve the static assets efficiently
FROM nginx:stable-alpine
# Copy the built assets from the 'build' stage into Nginx's public folder
COPY --from=build /app/build /usr/share/nginx/html

# Copy a custom Nginx configuration to ensure routing works correctly (e.g., for client-side routing)
# NOTE: You must ensure you have a simple 'nginx.conf' file in your frontend root folder.
# If you do not have one, you can comment this line out and rely on Nginx's defaults.
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the standard Nginx port
EXPOSE 80

# The container will run Nginx to serve the site
CMD ["nginx", "-g", "daemon off;"]

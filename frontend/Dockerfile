# Use the official Node.js LTS image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy the rest of your application code
COPY . .

# Expose the port your app runs on (change if needed)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
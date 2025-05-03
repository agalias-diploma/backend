# Use Node.js LTS as base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

RUN apt-get update

# Copy the rest of the app
COPY . .

# Expose port
EXPOSE 3000

# Start the backend
CMD ["npm", "run", "start"]

# Use an official Node runtime as a parent image
FROM node:18.18.0

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy the build artifacts to the working directory
COPY dist ./dist
COPY .env ./

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Run the NestJS application
CMD [ "npm", "run", "start:prod" ]

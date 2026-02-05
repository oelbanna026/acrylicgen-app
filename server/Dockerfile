# Use Node.js LTS (Long Term Support)
FROM node:18-bullseye-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Bundle app source
COPY . .

# Create volume for database persistence
VOLUME /usr/src/app/data

# Expose port
EXPOSE 3001

# Start command
CMD [ "npm", "start" ]

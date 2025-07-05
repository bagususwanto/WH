FROM node:18

WORKDIR /app

# Copy hanya package files dulu
COPY package*.json ./

# Install di dalam container Linux
RUN npm install

# Install Firebase CLI
RUN npm install -g firebase-tools

# Copy source code (tanpa node_modules)
COPY . .

# Pastikan tidak ada node_modules dari host
RUN rm -rf node_modules/.cache

EXPOSE 3000
CMD ["npm", "run", "start", "--", "--host"]
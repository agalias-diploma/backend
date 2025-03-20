#!/bin/bash

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color
REGION="eu-north-1"

echo -e "${GREEN}Starting deployment process...${NC}"

# Ensure we're in the right directory
cd /home/ubuntu/backend || {
    echo -e "${RED}Failed to change directory to /home/ubuntu/backend${NC}"
    exit 1
}

echo -e "${YELLOW}Updating system packages...${NC}"
sudo apt update || {
    echo -e "${RED}Failed to update packages${NC}"
    exit 1
}

echo -e "${YELLOW}Adding Node.js repository...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - || {
    echo -e "${RED}Failed to add Node.js repository${NC}"
    exit 1
}

echo -e "${YELLOW}Installing Node.js and Nginx...${NC}"
sudo apt-get install -y nodejs nginx || {
    echo -e "${RED}Failed to install Node.js and Nginx${NC}"
    exit 1
}

echo -e "${YELLOW}Installing AWS CLI...${NC}"
sudo apt-get install -y awscli || {
    echo -e "${RED}Failed to install AWS CLI${NC}"
    exit 1
}

echo -e "${YELLOW}Installing dependencies...${NC}"
npm install || {
    echo -e "${RED}Failed to install npm dependencies${NC}"
    exit 1
}

echo -e "${YELLOW}Retrieving SSL certificates from SSM...${NC}"

# Replace 'YOUR_CERT_ARN' and 'YOUR_PRIVATE_KEY' with the actual SSM parameter names
CERT_SSL_CHAIN=$(aws ssm get-parameter --name "/certs/stage-agalias" --query "Parameter.Value" --region $REGION --output text --with-decryption)
PRIVATE_SSL_KEY=$(aws ssm get-parameter --name "/certs/stage-agalias-key" --query "Parameter.Value" --region $REGION --output text --with-decryption)

# Create directories for SSL certificates if they don't exist
sudo mkdir -p /etc/ssl/api-stage.agalias-project.online/

# Save the retrieved certificates to files
echo "$CERT_SSL_CHAIN" | sudo tee /etc/ssl/api-stage.agalias-project.online/fullchain.pem > /dev/null
echo "$PRIVATE_SSL_KEY" | sudo tee /etc/ssl/api-stage.agalias-project.online/privkey.pem > /dev/null

echo -e "${YELLOW}Configuring Nginx...${NC}"
if [ -f "nginx.conf" ]; then
    sudo cp nginx.conf /etc/nginx/sites-available/backend || {
        echo -e "${RED}Failed to copy nginx configuration${NC}"
        exit 1
    }
    
    # Remove existing symlink if it exists
    sudo rm -f /etc/nginx/sites-enabled/backend
    
    # Create new symlink
    sudo ln -s /etc/nginx/sites-available/backend /etc/nginx/sites-enabled/ || {
        echo -e "${RED}Failed to create Nginx symlink${NC}"
        exit 1
    }
else
    echo -e "${RED}nginx.conf not found in current directory${NC}"
    exit 1
fi

echo -e "${YELLOW}Permissions to nginx${NC}"
sudo chown -R www-data:www-data /etc/ssl/api-stage.agalias-project.online

echo -e "${YELLOW}Testing Nginx configuration...${NC}"
sudo nginx -t || {
    echo -e "${RED}Nginx configuration test failed${NC}"
    exit 1
}

echo -e "${YELLOW}Restarting Nginx...${NC}"
sudo systemctl restart nginx || {
    echo -e "${RED}Failed to restart Nginx${NC}"
    exit 1
}

echo -e "${YELLOW}Starting the backend application...${NC}"
# Using PM2 for process management
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}Installing PM2...${NC}"
    sudo npm install -g pm2 || {
        echo -e "${RED}Failed to install PM2${NC}"
        exit 1
    }
fi

pm2 start npm --name "backend" -- start || {
    echo -e "${RED}Failed to start backend application${NC}"
    exit 1
}

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${YELLOW}Checking service status:${NC}"
pm2 list
sudo systemctl status nginx

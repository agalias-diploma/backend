#!/bin/bash
set -e

# Default region and profile
REGION="eu-north-1"
AWS_PROFILE="agalias-ssm"

# Color definitions for better visibility
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting secrets retrieval from AWS Parameter Store using profile ${AWS_PROFILE}...${NC}"

# AWS IAM secrets
AWS_ACCESS_KEY=$(aws ssm get-parameter --name "/backend/aws_access_key" --query "Parameter.Value" --region $REGION --output text --with-decryption --profile ${AWS_PROFILE})
if [ -z "$AWS_ACCESS_KEY" ]; then
    echo -e "${RED}Failed to fetch AWS Access Key${NC}"
    exit 1
fi

AWS_SECRET_ACCESS_KEY=$(aws ssm get-parameter --name "/backend/secret_aws_access_key" --query "Parameter.Value" --region $REGION --output text --with-decryption --profile ${AWS_PROFILE})
if [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo -e "${RED}Failed to fetch AWS Secret Access Key${NC}"
    exit 1
fi

AWS_BUCKET_NAME=$(aws ssm get-parameter --name "/backend/s3_bucket_name" --query "Parameter.Value" --region $REGION --output text --profile ${AWS_PROFILE})
if [ -z "$AWS_BUCKET_NAME" ]; then
    echo -e "${RED}Failed to fetch S3 Bucket Name${NC}"
    exit 1
fi

# Google OAuth secrets
CLIENT_ID=$(aws ssm get-parameter --name "/backend/google_oauth_client_id" --query "Parameter.Value" --region $REGION --output text --with-decryption --profile ${AWS_PROFILE})
if [ -z "$CLIENT_ID" ]; then
    echo -e "${RED}Failed to fetch Google OAuth Client ID${NC}"
    exit 1
fi

CLIENT_SECRET=$(aws ssm get-parameter --name "/backend/google_oauth_client_secret" --query "Parameter.Value" --region $REGION --output text --with-decryption --profile ${AWS_PROFILE})
if [ -z "$CLIENT_SECRET" ]; then
    echo -e "${RED}Failed to fetch Google OAuth Client Secret${NC}"
    exit 1
fi

GOOGLE_OAUTH_CALLBACK_URL=$(aws ssm get-parameter --name "/backend/google_oauth_callback_url" --query "Parameter.Value" --region $REGION --output text --profile ${AWS_PROFILE})
if [ -z "$GOOGLE_OAUTH_CALLBACK_URL" ]; then
    echo -e "${RED}Failed to fetch Google OAuth Callback URL${NC}"
    exit 1
fi

# MongoDB secrets
DB_CONNECTION=$(aws ssm get-parameter --name "/backend/db_connection_uri" --query "Parameter.Value" --region $REGION --output text --with-decryption --profile ${AWS_PROFILE})
if [ -z "$DB_CONNECTION" ]; then
    echo -e "${RED}Failed to fetch MongoDB Connection URI${NC}"
    exit 1
fi

# Frontend URL
FRONTEND_URL=$(aws ssm get-parameter --name "/backend/frontend_url" --query "Parameter.Value" --region $REGION --output text --profile ${AWS_PROFILE})
if [ -z "$FRONTEND_URL" ]; then
    echo -e "${RED}Failed to fetch Frontend URL${NC}"
    exit 1
fi

echo -e "${GREEN}Creating .env file...${NC}"
cat << EOF > .env
AWS_ACCESS_KEY=${AWS_ACCESS_KEY}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
AWS_S3_BUCKET_REGION=${REGION}
AWS_BUCKET_NAME=${AWS_BUCKET_NAME}
CLIENT_ID=${CLIENT_ID}
CLIENT_SECRET=${CLIENT_SECRET}
GOOGLE_OAUTH_CALLBACK_URL=${GOOGLE_OAUTH_CALLBACK_URL}
DB_CONNECTION=${DB_CONNECTION}
FRONTEND_URL=${FRONTEND_URL}
EOF

echo -e "${GREEN}All environment variables set successfully!${NC}"

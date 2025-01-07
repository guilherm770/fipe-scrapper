# main.tf
provider "aws" {
  region = "us-west-2"
}

# VPC and Security Group
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "fipe-scrapper-vpc"
  }
}

resource "aws_subnet" "main" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "us-west-2a"

  tags = {
    Name = "fipe-scrapper-subnet"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "fipe-scrapper-igw"
  }
}

resource "aws_route_table" "main" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "fipe-scrapper-rt"
  }
}

resource "aws_route_table_association" "main" {
  subnet_id      = aws_subnet.main.id
  route_table_id = aws_route_table.main.id
}

resource "aws_security_group" "app" {
  name        = "fipe-scrapper-sg"
  description = "Security group for Fipe Scrapper"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Key Pair
resource "aws_key_pair" "deployer" {
  key_name   = "fipe-scrapper-key"
  public_key = file("~/.ssh/id_rsa.pub")
}

# EC2 Instance
resource "aws_instance" "app" {
  ami           = "ami-0735c191cf914754d"  # Ubuntu 20.04 LTS
  instance_type = "t2.small"

  subnet_id                   = aws_subnet.main.id
  vpc_security_group_ids      = [aws_security_group.app.id]
  associate_public_ip_address = true
  key_name                   = aws_key_pair.deployer.key_name

  root_block_device {
    volume_size = 20
  }

  user_data = <<-EOF
              #!/bin/bash
              apt-get update
              apt-get install -y docker.io git
              systemctl start docker
              systemctl enable docker
              usermod -aG docker ubuntu

              # Create a temporary Dockerfile with correct permissions
              mkdir -p /opt/fipe-scrapper
              cd /opt/fipe-scrapper
              git clone https://github.com/guilherm770/fipe-scrapper.git .

              # Build and run the Docker container
              docker build -t fipe-scrapper .
              docker run -d -p 3000:3000 fipe-scrapper
              EOF

  tags = {
    Name = "fipe-scrapper"
  }
}

output "public_ip" {
  value = aws_instance.app.public_ip
}
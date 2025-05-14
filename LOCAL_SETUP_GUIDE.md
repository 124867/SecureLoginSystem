# Local Setup Guide for Email Application (Java Spring Boot)

## Prerequisites

1. **Java Development Kit (JDK) 17**
   - Download from [Oracle](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html) or [AdoptOpenJDK](https://adoptium.net/)
   - Verify installation with: `java -version`

2. **Maven**
   - Download from [Maven's official site](https://maven.apache.org/download.cgi)
   - Install following the [installation guide](https://maven.apache.org/install.html)
   - Verify with: `mvn -version`

3. **PostgreSQL**
   - Download from [PostgreSQL's official site](https://www.postgresql.org/download/)
   - Create a database named `emailapp`
   - Note your username and password

## Setup Steps

1. **Clone/Download the Project**
   - Download the project files to your local machine

2. **Configure Database**
   - Open `src/main/resources/application.properties`
   - Update the database connection settings:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/emailapp
   spring.datasource.username=YOUR_USERNAME
   spring.datasource.password=YOUR_PASSWORD
   ```

3. **Build the Project**
   ```bash
   mvn clean install
   ```

4. **Run the Application**
   ```bash
   mvn spring-boot:run
   ```
   The application will start on port 8080

## Project Structure

- **Models**: `src/main/java/com/example/emailapp/model/`
  - User.java - User entity with JWT authentication
  - Email.java - Email entity

- **Security**: `src/main/java/com/example/emailapp/security/`
  - JWT authentication components

- **Controllers**: `src/main/java/com/example/emailapp/controller/`
  - Auth endpoints (login, register)
  - Email endpoints

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token
- `GET /api/auth/current-user` - Get current user info

### Emails
- `GET /api/emails` - Get user emails
- `POST /api/emails` - Create a new email
- `PUT /api/emails/{id}/status` - Update email status
- `PUT /api/emails/{id}/read` - Mark as read/unread
- `PUT /api/emails/{id}/star` - Star/unstar email

## Testing with Postman

1. Register a user
   - POST to `http://localhost:8080/api/auth/register`
   - Body:
   ```json
   {
     "username": "testuser",
     "email": "test@example.com",
     "password": "password123",
     "name": "Test User"
   }
   ```

2. Login to get JWT token
   - POST to `http://localhost:8080/api/auth/login`
   - Body:
   ```json
   {
     "username": "testuser",
     "password": "password123"
   }
   ```
   - Save the returned JWT token

3. Use the token for authenticated requests
   - Add header: `Authorization: Bearer YOUR_JWT_TOKEN`

## Next Steps

After setting up locally, you can:
1. Use the frontend React application with this backend
2. Extend the application with additional features
3. Customize security settings in `SecurityConfig.java`

## Troubleshooting

- **Port already in use**: Change port in application.properties (server.port=8081)
- **Database connection issues**: Check PostgreSQL is running and credentials are correct
- **Compile errors**: Ensure Java 17 is installed and properly configured
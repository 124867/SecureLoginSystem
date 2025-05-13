# Email Application - Java Spring Boot

This is an email application with a RESTful API built using Java Spring Boot. The project has been converted from a TypeScript/Node.js application to Java.

## Prerequisites

- Java 17 or higher
- Maven 3.6 or higher
- PostgreSQL 12 or higher

## Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE emailapp;
```

2. Update the database configurations in `src/main/resources/application.properties` if needed:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/emailapp
spring.datasource.username=postgres
spring.datasource.password=postgres
```

## Running the Application

### Using Maven

1. Build the application:
```bash
mvn clean package
```

2. Run the application:
```bash
mvn spring-boot:run
```

### Using the JAR file

1. Build the application:
```bash
mvn clean package
```

2. Run the JAR file:
```bash
java -jar target/emailapp-0.0.1-SNAPSHOT.jar
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login and receive a JWT token
- GET /api/auth/current-user - Get the current user information

### Emails
- GET /api/emails - Get user emails
- GET /api/emails/{id} - Get a specific email
- POST /api/emails - Create a new email
- PUT /api/emails/{id}/status - Update email status
- PUT /api/emails/{id}/read - Mark email as read or unread
- PUT /api/emails/{id}/star - Star or unstar an email
- DELETE /api/emails/{id} - Delete an email

## Project Structure

- `src/main/java/com/example/emailapp/model` - Entity classes
- `src/main/java/com/example/emailapp/repository` - Data access interfaces
- `src/main/java/com/example/emailapp/controller` - REST controllers
- `src/main/java/com/example/emailapp/service` - Business logic
- `src/main/java/com/example/emailapp/security` - JWT authentication
- `src/main/java/com/example/emailapp/exception` - Exception handling
- `src/main/java/com/example/emailapp/dto` - Data Transfer Objects
- `src/main/resources` - Application properties and other resources
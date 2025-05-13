# Running the Email App Locally

This guide provides step-by-step instructions for running the Java Spring Boot email application on your local machine.

## Prerequisites

1. **Java Development Kit (JDK) 17**
   - Download and install from [Oracle](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html) or use [OpenJDK](https://jdk.java.net/17/)
   - Verify installation: `java -version`

2. **Maven**
   - Download from [Maven's official website](https://maven.apache.org/download.cgi)
   - Install according to [installation instructions](https://maven.apache.org/install.html)
   - Verify installation: `mvn -version`

3. **PostgreSQL**
   - Download and install from [PostgreSQL's official website](https://www.postgresql.org/download/)
   - Create a database named `emailapp`

## Configuring the Application

1. **Update Database Connection**
   - Open `src/main/resources/application.properties`
   - Modify the following settings to match your PostgreSQL configuration:
     ```properties
     spring.datasource.url=jdbc:postgresql://localhost:5432/emailapp
     spring.datasource.username=YOUR_USERNAME
     spring.datasource.password=YOUR_PASSWORD
     ```

## Building and Running the Application

### Option 1: Using Maven Command Line

1. **Build the Application**
   ```bash
   mvn clean package
   ```
   This command will:
   - Clean any previous builds
   - Download dependencies
   - Compile the source code
   - Package the application into a JAR file

2. **Run the Application**
   ```bash
   mvn spring-boot:run
   ```
   The application should start on port 8080.

### Option 2: Using the JAR File

1. **Build the JAR file**
   ```bash
   mvn clean package
   ```

2. **Run the JAR file**
   ```bash
   java -jar target/emailapp-0.0.1-SNAPSHOT.jar
   ```

## Accessing the Application

- The application will be available at: http://localhost:8080
- API endpoints can be accessed with the base URL: http://localhost:8080/api

## Troubleshooting

1. **Port Already in Use**
   - If port 8080 is already in use, you can change the port in `application.properties`:
     ```properties
     server.port=8081
     ```

2. **Database Connection Issues**
   - Ensure PostgreSQL is running
   - Verify database credentials in application.properties
   - Check that the database `emailapp` exists

3. **Java Version Issues**
   - Ensure you are using Java 17
   - If you have multiple Java versions installed, set JAVA_HOME environment variable to point to Java 17
   
## Additional Development Tools

For a better development experience, consider using:
- **IntelliJ IDEA**: Excellent IDE for Java and Spring Boot development
- **Postman**: For testing API endpoints
- **pgAdmin**: For managing your PostgreSQL database

Happy coding!
const { spawn } = require('child_process');

console.log('Starting Spring Boot application...');

// Run Maven Spring Boot
const mvn = spawn('mvn', ['spring-boot:run']);

// Output from the Maven process
mvn.stdout.on('data', (data) => {
  console.log(`${data}`);
});

mvn.stderr.on('data', (data) => {
  console.error(`${data}`);
});

mvn.on('close', (code) => {
  console.log(`Maven process exited with code ${code}`);
});
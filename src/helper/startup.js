
/**
 * It verifies configuration file at startup
 */
function verifyConfiguration() {
  const configs = ["DATABASE_URL", "JWT_SECRET"]

  for(let i=0;i<configs.length;i++){
    if(!(configs[i] in process.env)){
      console.log(`${configs[i]} is not set in ".env" file. Please set it and run again.`)
      console.log(`The program will not exit.`)
      process.exit(1)
    }
  }
}

module.exports = verifyConfiguration

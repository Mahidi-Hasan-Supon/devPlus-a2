import { Pool } from "pg";
import config from "../config";

export const pool = new Pool({
  connectionString: config.db_key,
});

export const initDB = async () => {
  try {
    await pool.query
     (`
      CREATE TABLE IF NOT EXISTS users(
          id SERIAL PRIMARY KEY,
          name VARCHAR(35) NOT NULL,
          email VARCHAR(35) UNIQUE NOT NULL ,
          password TEXT NOT NULL ,
          role VARCHAR(30) NOT NULL DEFAULT 'contributor', 

          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    ) 
          `
        
    )
      await pool.query
     ( 
        `
        CREATE TABLE IF NOT EXISTS issues(
        id SERIAL PRIMARY KEY ,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL CHECK (LENGTH(description) >= 20), 
        type VARCHAR(25) NOT NULL CHECK (type IN('bug' , 'feature_request')),
        status VARCHAR(25) NOT NULL DEFAULT 'open' CHECK (status IN('open' , 'in_progress' , 'resolved')),
        reporter_id INT REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        `)
      
      

    console.log("Express server connected successful");
  } catch (error) {
    console.log(error);
  }
};

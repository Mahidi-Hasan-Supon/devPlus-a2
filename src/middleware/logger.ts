import type { NextFunction, Request, Response } from "express";
import fs from "fs"

const logger = (req:Request, res:Response, next : NextFunction) => {
//   console.log("LOGGED");
  const log = `([${new Date().toLocaleString()}], ${req.method}, ${req.url} )`
  fs.appendFile("logger.txt" , log , (error)=>{
//   console.log(error);
  })
  next();
};
export default logger
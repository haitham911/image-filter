import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import {Request, Response} from 'express';
import fetch from 'cross-fetch';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());
  app.use(function(req, res, next) {
    if (!req.headers.authorization) {
      return res.status(401).json({
        status: 401,
        message: 'Unauthorized Error: Invalid access token.'
      }).end();
    } else {
      var obj = {  
        headers: {
          Authorization: req.headers.authorization
        }
      }
      fetch("http://rutener-dev-dev.us-east-1.elasticbeanstalk.com/api/v0/users/auth/verification",obj)
      .then((response) => {
        return response.json();
      }).then((authValid) => {
        if (!authValid.hasOwnProperty('auth')){
          return res.status(401).json({
            status: 401,
            message: 'Unauthorized Error: Invalid access token.'
          }).end();
           
        }
        if (!authValid.auth){
          return res.status(401).json({
            status: 401,
            message: 'Unauthorized Error: Invalid access token.'
          }).end();

        }
        
        next();
        
      }).catch((error) => {
         
          return res.status(401).json({
              status: 401,
              message: 'Unauthorized Error: Invalid access token.'
            }).end();
       
      });
 
    }
  });
  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  //! END @TODO1
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get("/filteredimage/",async (req: Request,res: Response)=>{
    let {image_url}: any = req.query;
    if( !image_url ) {
      return res.status(422)
                .send(`url required`);
    }
      else{
        filterImageFromURL(image_url).then((result)=>{
        res.sendFile(result);
        res.on(`finish`,()=>deleteLocalFiles([result]));
        }).catch((err)=>res.status(422).send(err))
      }
  } );
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  
 

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();
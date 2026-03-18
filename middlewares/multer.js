// multer is a package which helps to store the frontend images, videos in public folder in be
// import multer from 'multer'


// // cb-callback
// const storage=multer.diskStorage({
//     destination:(req,file,cb)=>{
//         cb(null,'./public')
//     },
//     filename:(req,file,cb)=>{
//         cb(null,file.originalname)
//     }
// })


// export const upload=multer({storage})

import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/")
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname)
  }
})

export const upload = multer({ storage })
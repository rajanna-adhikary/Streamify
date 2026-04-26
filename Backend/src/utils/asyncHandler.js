// const asyncHandler=(fn)=>{async(req,res,next)=>{
//     try{
//             await fn(req,res,next)
//     }catch(error){
//             console.log(err.code || 500).json(
//                 {
//                     success:false,
//                     message:err.message,
//                 }
//             )
//     }
// }}

//another way 
//BENEFIR OF THIS FILE: HAR CHIZ KO HUME TRY CATCH MNHI DAALNA PADEGA(CONTROLLERS,ROUTES KE POV SE BAAT KAR RAHE HAI)
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}


export {asyncHandler}
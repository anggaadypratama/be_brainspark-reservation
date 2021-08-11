const message = require('@utils/messages');
// const { isValidObjectId } = require('mongoose');
const validationId = new RegExp('^[0-9a-fA-F]{24}$');
const DashboardEventModel = require('../DashboardEvent/model');

module.exports ={
  inputPart:async (req,res)=>{
    const { id } = req.params;
    const info = {namae,email} = req.body;

    const userDB = await DashboardEventModel.exists({_id:id}).then(true)
    .catch(err => console.log("")) // return query
    // const userDB = await DashboardEventModel.exists({_id:id}).then(true)
    // .catch(err => console.log(err))
    // const ekis = userDB.where(id).exists(true)

    if (!validationId.test(id)) {
      res.sendError({
        message: 'id tidak ditemukan',
        status: 404,
      }); 
    }else if(!userDB){
      res.sendError({
        message: 'id not found',
        status: 404,
      }); 
    }
    else {
      await DashboardEventModel.findByIdAndUpdate(id,{$push: {participant:info}},{runValidators: true}).catch((errors) => {
        if (errors) {
          res.sendError({ errors });
        }
      });
      // console.log(userDB.tree)
      // console.log(userDB.select({'_id':id}))
      // console.log(userDB)
      if (userDB) {
        console.log(userDB)
      }
      res.sendSuccess({ message: message.add_data_success, status: 201 });
    };
  }
};
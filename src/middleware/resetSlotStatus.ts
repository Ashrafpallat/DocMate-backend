import { NextFunction, Request, Response } from "express";
import { DefaultTokenModel } from "../models/defaultTokenModel";
import moment from "moment";  

async function resetOutdatedSlots(req: Request, res: Response, next: NextFunction) {
    try {
        const currentDate = new Date().setHours(0, 0, 0, 0);  
        const today = moment().format('dddd');  
        const { doctorId } = req.params;  // Extract doctorId from route params
        console.log('at reset slot', doctorId);
        
        
        const token = await DefaultTokenModel.findOne({
            doctorId: doctorId,  
            day: today            
        });        
        if (token) {
            let isUpdated = false;
    
            
            token.slots.forEach(slot => {                
                if (
                    slot.status !== 'issued' &&
                    new Date(new Date(slot.statusUpdatedAt).setHours(0, 0, 0, 0)) < new Date(currentDate)
                ) {                    
                    slot.status = 'issued';
                    slot.statusUpdatedAt = new Date();
                    slot.patientId = undefined;
                    isUpdated = true;
                }
            });
    
            
            if (isUpdated) {
                await token.save();
                console.log('updated');
                
            }
            console.log('end of reset slot');
            
        }
        next() 
    } catch (error) {
        console.log('error at rest slote mdlwr', error);
        
    }
    
}

export default resetOutdatedSlots;

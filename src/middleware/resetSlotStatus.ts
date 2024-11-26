import { DefaultTokenModel } from "../models/defaultTokenModel";

async function resetOutdatedSlots(defaultTokenId: string) {
    const currentDate = new Date().setHours(0, 0, 0, 0);

    const token = await DefaultTokenModel.findOne({ _id: defaultTokenId });

    if (token) {
        let isUpdated = false;

        token.slots.forEach(slot => {
            if (slot.status !== 'issued' && new Date(slot.statusUpdatedAt).setHours(0, 0, 0, 0) < currentDate) {
                slot.status = 'issued';
                slot.statusUpdatedAt = new Date();
                slot.patientId = undefined;
                isUpdated = true;
            }
        });

        if (isUpdated) {
            await token.save();
        }
    }
}

export default resetOutdatedSlots
import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: true,
            trim: true
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
            index:true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
)


commentSchema.plugin(mongooseAggregatePaginate) ////kaha se kaha tak vid/comment dene next call pe bas itna hi kaam hai

export const Comment = mongoose.model("Comment", commentSchema)
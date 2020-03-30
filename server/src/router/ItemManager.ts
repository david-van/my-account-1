import { Request, Response } from "express"
import Message from "../bean/Message"
import { router } from "../decorators/web"
import Item from "../model/Item";
import DateUtil from "../util/DateUtil";
export default class ItemManager {
    /**
     *  添加一条收支
     */
    @router("post", "/item/add")
    async  addItem(req: Request, res: Response) {
        let body = req.body;
        let i = new Item({
            type: body.type,
            detail: body.detail,
            money: body.money,
            date: new Date(),
            phoneNumber: "13737148529",
            remark: body.remark,
            account: body.account
        });
        i.save((err, product) => {
            if (err) {
                res.json(new Message(0, "保存错误!", null));
            } else {
                res.json(new Message(1, "保存成功!", product));
            }
        })
    }
    /**
    *  删除一条收支
    */
    @router("post", "/item/romeve")
    async remove(req: Request, res: Response) {
        let body = req.body;
        let dlt = await Item.deleteOne({
            _id: body._id,
            phoneNumber: "13737148529"
        });
        res.json(new Message(1, "删除成功!", dlt));
    }


    /**
     * 按月份查询 并且分类--按收入和支出
     */
    @router("post", "/item/findMonthAndType")
    async findMonthAndType(req: Request, res: Response) {
        let dates = ItemManager.getDate(req, res);
        let array = await Item.aggregate([
            {
                '$match': {
                    'phoneNumber': '13737148529',
                    'date': {
                        '$gte': dates["now"],
                        '$lt': dates["next"]
                    }
                }
            }, {
                '$group': {
                    '_id': '$type',
                    'all': {
                        '$sum': '$money'
                    },
                    'items': {
                        '$push': '$$ROOT'
                    }
                }
            }
        ]
        );
        res.json(new Message(1, "查询成功!", array));
    }
    /**
        * 按月份查询,不发类
        */
    @router("post", "/item/findMonth")
    async findMonthe(req: Request, res: Response) {
        let dates = ItemManager.getDate(req, res);
        console.log(dates);

        let array = await Item.aggregate([
            {
                '$match': {
                    'phoneNumber': '13737148529',
                    'date': {
                        '$gte': dates["now"],
                        '$lt': dates["next"]
                    }
                }
            }
        ]
        );
        res.json(new Message(1, "查询成功!", array));
    }

    /**
     * 按月份查询 并且分类--按晚餐-购物之类
     */
    @router("post", "/item/findMonthAndDetail")
    async findMonthAndDetail(req: Request, res: Response) {
        let dates = ItemManager.getDate(req, res);
        let array = await Item.aggregate([
            {
                '$match': {
                    'phoneNumber': '13737148529',
                    'date': {
                        '$gte': dates["now"],
                        '$lt': dates["next"]
                    }
                }
            }, {
                '$group': {
                    '_id': '$detail',
                    'all': {
                        '$sum': '$money'
                    },
                    'items': {
                        '$push': '$$ROOT'
                    }
                }
            }
        ]
        );
        res.json(new Message(1, "查询成功!", array));
    }

    //获取时间
    static getDate(req, res) {
        let body = req.body;
        if (!body.year || !body.month) {
            res.json(new Message(0, "请输入正确的时间!", null));
        }
        return DateUtil.nextMonth(Number(body.year), Number(body.month));
    }
}

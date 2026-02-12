import { Inngest } from "inngest";

type Events = {
    "app/doc.uploaded": {
        data: {
            docId: string;
            userId: string;
            filePath: string;
            fileName: string;
        };
    };
};

export const inngest = new Inngest({ id: "documind" });

export type { Events };

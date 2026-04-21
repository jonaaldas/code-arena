import defineAuthenticatedEventHandler from "../utils/defineAuthHandler";

export default defineAuthenticatedEventHandler(async (event) => {
    const { type, token } = await readBody(event) as { type: string, token: string };

})
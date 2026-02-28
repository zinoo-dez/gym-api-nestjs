import { MarketingController } from './marketing.controller';

describe('MarketingController', () => {
    let controller: MarketingController;
    let marketingServiceMock: any;

    beforeEach(() => {
        marketingServiceMock = {
            listTemplates: jest.fn(),
            createTemplate: jest.fn(),
            updateTemplate: jest.fn(),
            createCampaign: jest.fn(),
            listCampaigns: jest.fn(),
            getCampaign: jest.fn(),
            updateCampaign: jest.fn(),
            sendCampaign: jest.fn(),
            logCampaignEvent: jest.fn(),
            getCampaignAnalytics: jest.fn(),
            listAutomations: jest.fn(),
            createAutomation: jest.fn(),
            updateAutomation: jest.fn(),
            runAutomations: jest.fn(),
        };

        controller = new MarketingController(marketingServiceMock);
    });

    it('lists templates', async () => {
        marketingServiceMock.listTemplates.mockResolvedValue([{ id: 'tpl-1' }]);

        const result = await controller.listTemplates();

        expect(result).toEqual([{ id: 'tpl-1' }]);
        expect(marketingServiceMock.listTemplates).toHaveBeenCalled();
    });

    it('creates campaign with current user id', async () => {
        marketingServiceMock.createCampaign.mockResolvedValue({ id: 'camp-1' });

        const dto: any = {
            name: 'Reactivation',
            type: 'EMAIL',
            content: 'Welcome back!',
        };

        const result = await controller.createCampaign(dto, {
            id: 'admin-1',
            userId: 'admin-1',
            email: 'admin@test.com',
            role: 'ADMIN',
        } as any);

        expect(result).toEqual({ id: 'camp-1' });
        expect(marketingServiceMock.createCampaign).toHaveBeenCalledWith(
            dto,
            'admin-1',
        );
    });

    it('sends campaign', async () => {
        marketingServiceMock.sendCampaign.mockResolvedValue({
            campaignId: 'camp-1',
        });

        const result = await controller.sendCampaign('camp-1');

        expect(result).toEqual({ campaignId: 'camp-1' });
        expect(marketingServiceMock.sendCampaign).toHaveBeenCalledWith('camp-1');
    });

    it('returns campaign analytics', async () => {
        marketingServiceMock.getCampaignAnalytics.mockResolvedValue({
            campaignId: 'camp-1',
            openRate: 50,
            clickRate: 20,
        });

        const result = await controller.getCampaignAnalytics('camp-1');

        expect(result).toMatchObject({ campaignId: 'camp-1', openRate: 50 });
        expect(marketingServiceMock.getCampaignAnalytics).toHaveBeenCalledWith(
            'camp-1',
        );
    });

    it('runs selected automation type', async () => {
        marketingServiceMock.runAutomations.mockResolvedValue({ processed: 1 });

        const result = await controller.runAutomationByType(
            'BIRTHDAY_WISHES' as any,
        );

        expect(result).toEqual({ processed: 1 });
        expect(marketingServiceMock.runAutomations).toHaveBeenCalledWith(
            'BIRTHDAY_WISHES',
        );
    });
});

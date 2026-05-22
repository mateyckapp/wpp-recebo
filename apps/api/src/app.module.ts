import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { UsersModule } from './modules/users/users.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { MessagesModule } from './modules/messages/messages.module';
import { KanbanModule } from './modules/kanban/kanban.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { ScheduledMessagesModule } from './modules/scheduled-messages/scheduled-messages.module';
import { AiModule } from './modules/ai/ai.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { BillingModule } from './modules/billing/billing.module';
import { AgendaModule } from './modules/agenda/agenda.module';
import { AdminModule } from './modules/admin/admin.module';
import { PublicAgendaModule } from './modules/public-agenda/public-agenda.module';
import { EmailModule } from './modules/email/email.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { PlanLimitsModule } from './modules/plan-limits/plan-limits.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { appConfig } from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 60,
      },
    ]),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    TenantsModule,
    UsersModule,
    ContactsModule,
    ConversationsModule,
    MessagesModule,
    KanbanModule,
    WhatsappModule,
    TemplatesModule,
    ScheduledMessagesModule,
    AiModule,
    CampaignsModule,
    BillingModule,
    AgendaModule,
    AdminModule,
    PublicAgendaModule,
    EmailModule,
    WebsocketModule,
    PlanLimitsModule,
    AnalyticsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}

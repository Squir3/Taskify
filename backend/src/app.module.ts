import 'dotenv/config';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskModule } from './tasks/task.module';
import { ProjectModule } from './projects/project.module';
import { AppController } from './app.controller'; // Import AppController
import { AppService } from './app.service'; // Import AppService
import { NotificationsGateway } from './notifications/notifications.gateway';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module'; // Import UserModule
import { v4 as uuidv4 } from 'uuid';

// Wygeneruj losowy secret przy każdym starcie backendu
const JWT_SECRET: string = (uuidv4 as () => string)();
process.env.JWT_SECRET = JWT_SECRET;

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  throw new Error('Brak zmiennej środowiskowej MONGO_URI!');
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(mongoUri),
    TaskModule,
    ProjectModule,
    AuthModule,
    UserModule, // Dodano UserModule
  ],
  controllers: [AppController], // Dodano AppController
  providers: [AppService, NotificationsGateway], // Dodano NotificationsGateway
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskModule } from './tasks/task.module';
import { ProjectModule } from './projects/project.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost/taskify',
    ),
    TaskModule,
    ProjectModule,
  ],
})
export class AppModule {}

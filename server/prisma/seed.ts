import { PrismaClient, UserRoleType, Gender, OpportunityType, OpportunityMode, OpportunityStatus, AuthorType, OrganizerType, EventMode, ConnectionStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_MIGRATE || process.env.DATABASE_URL
});
const adapter = new PrismaPg(pool as never);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding the database...');

  // Clear existing (optional, but recommended for repeatable seeding)
  await prisma.postComment.deleteMany();
  await prisma.postLike.deleteMany();
  await prisma.post.deleteMany();
  await prisma.connection.deleteMany();
  await prisma.eventBooking.deleteMany();
  await prisma.event.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.education.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create 5 Users with Roles, Profiles, Educations, Experiences, Certificates
  const users = [];
  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.create({
      data: {
        id: `user-${i}`,
        email: `user${i}@example.com`,
        name: `User ${i}`,
        passwordHash,
        verified: true,
      }
    });
    users.push(user);
    
    // Create Role
    await prisma.userRole.create({
      data: {
        userId: user.id,
        role: i === 1 ? UserRoleType.company_owner : UserRoleType.candidate
      }
    });

    // Create Profile
    await prisma.userProfile.create({
      data: {
        userId: user.id,
        fullName: `Full Name ${i}`,
        about: `Hi, I am User ${i}`,
        gender: Gender.male,
      }
    });

    // Create Education
    await prisma.education.create({
      data: {
        profileUserId: user.id,
        institution: `University ${i}`,
        degree: `B.Sc. CS`,
        startDate: new Date('2020-01-01'),
        endDate: new Date('2024-01-01')
      }
    });

    // Create Experience
    await prisma.experience.create({
      data: {
        profileUserId: user.id,
        title: `Software Engineer`,
        company: `Company X`,
        startDate: new Date('2024-02-01')
      }
    });

    // Create Certificate
    await prisma.certificate.create({
      data: {
        profileUserId: user.id,
        title: `AWS Certified ${i}`,
        issuer: `Amazon`,
      }
    });
  }

  // 2. Create 5 Companies (Owned by user 1 to 5)
  const companies = [];
  for (let i = 1; i <= 5; i++) {
    const company = await prisma.company.create({
      data: {
        name: `Company ${i}`,
        ownerId: users[i-1].id,
        location: `City ${i}`,
        description: `Description for Company ${i}`
      }
    });
    companies.push(company);
  }

  // 3. Create 5 Opportunities
  const opportunities = [];
  for (let i = 1; i <= 5; i++) {
    const opp = await prisma.opportunity.create({
      data: {
        companyId: companies[i-1].id,
        type: OpportunityType.job,
        mode: OpportunityMode.onsite,
        status: OpportunityStatus.open,
        postName: `Software Developer ${i}`,
        description: `We are hiring a software developer ${i}`
      }
    });
    opportunities.push(opp);
  }

  // 4. Create 5 Posts
  const posts = [];
  for (let i = 1; i <= 5; i++) {
    const post = await prisma.post.create({
      data: {
        text: `This is post number ${i}`,
        authorType: AuthorType.user,
        authorUserId: users[i-1].id
      }
    });
    posts.push(post);
  }

  // 5. Create 5 PostLikes and 5 PostComments
  for (let i = 1; i <= 5; i++) {
    await prisma.postLike.create({
      data: {
        postId: posts[i-1].id,
        userId: users[i === 5 ? 0 : i].id // likes from another user
      }
    });
    
    await prisma.postComment.create({
      data: {
        postId: posts[i-1].id,
        userId: users[i === 5 ? 0 : i].id,
        text: `Nice post ${i}!`
      }
    });
  }

  // 6. Create 5 Events
  const events = [];
  for (let i = 1; i <= 5; i++) {
    const event = await prisma.event.create({
      data: {
        title: `Tech Conference ${i}`,
        organizerType: OrganizerType.company,
        organizerCompanyId: companies[i-1].id,
        schedule: new Date('2026-10-10'),
        mode: EventMode.online
      }
    });
    events.push(event);
  }

  // 7. Create 5 EventBookings
  for (let i = 1; i <= 5; i++) {
    await prisma.eventBooking.create({
      data: {
        eventId: events[i-1].id,
        userId: users[i === 5 ? 0 : i].id
      }
    });
  }

  // 8. Create 5 Connections
  for (let i = 1; i <= 5; i++) {
    await prisma.connection.create({
      data: {
        senderId: users[i-1].id,
        receiverId: users[i === 5 ? 0 : i].id,
        status: ConnectionStatus.accepted
      }
    });
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  await prisma.like_comment.deleteMany();
  await prisma.comment_news.deleteMany();
  await prisma.like_news.deleteMany();
  await prisma.news.deleteMany();
  await prisma.like_review.deleteMany();
  await prisma.project_review.deleteMany();
  await prisma.follow_project.deleteMany();
  await prisma.follow_creator.deleteMany();
  await prisma.team.deleteMany();
  await prisma.creator.deleteMany();
  await prisma.project.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const profilesData = [
    {
      username: "player1",
      role: "PLAYER",
      email: "player1@example.com",
      password: "password1",
    },
    {
      username: "player2",
      role: "PLAYER",
      email: "player2@example.com",
      password: "password2",
    },
    {
      username: "creator1",
      role: "CREATOR",
      email: "creator1@example.com",
      password: "password3",
    },
    {
      username: "creator2",
      role: "CREATOR",
      email: "creator2@example.com",
      password: "password4",
    },
  ];

  const users = [];
  for (const p of profilesData) {
    let profile = await prisma.profile.findUnique({
      where: { username: p.username },
    });
    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          username: p.username,
          bio: `${p.username} bio`,
          avatarUrl: null,
          socialLinks: [],
          isAnonymized: false,
        },
      });
    }

    let user = await prisma.user.findUnique({
      where: { email: p.email },
    });
    if (!user) {
      const hash = await bcrypt.hash(p.password, 10);
      user = await prisma.user.create({
        data: {
          email: p.email,
          password: hash,
          role: p.role,
          profile: { connect: { id: profile.id } },
        },
      });
    }
    users.push(user);
  }
  const [player1, player2, creator1, creator2] = users;

  const randomRating = () => Math.floor(Math.random() * 5) + 1;

  for (const creator of [creator1, creator2]) {
    for (let i = 1; i <= 2; i++) {
      const titreProjet = `Project_${creator.id}_${i}`;
      let projet = await prisma.project.findFirst({
        where: { title: titreProjet },
      });
      if (!projet) {
        projet = await prisma.project.create({
          data: {
            title: titreProjet,
            description: `Description du ${titreProjet}`,
            creator: { create: { ID_creator: creator.id } },
          },
        });
      }

      for (const num of [1, 2]) {
        const titreNews = `News${num}_${projet.id}`;
        let newsItem = await prisma.news.findFirst({
          where: { title: titreNews, ID_project: projet.id },
        });
        if (!newsItem) {
          newsItem = await prisma.news.create({
            data: {
              title: titreNews,
              content: num === 1 ? "Première update!" : "Deuxième update!",
              image: null,
              authorId: creator.id,
              ID_project: projet.id,
            },
          });
        }

        for (const liker of [player1, player2]) {
          const likeNews = await prisma.like_news.findFirst({
            where: { ID_user: liker.id, ID_news: newsItem.id },
          });
          if (!likeNews) {
            await prisma.like_news.create({
              data: { ID_user: liker.id, ID_news: newsItem.id },
            });
          }
        }

        if (num === 1) {
          let comment = await prisma.comment_news.findFirst({
            where: { ID_news: newsItem.id, ID_user: player2.id },
          });
          if (!comment) {
            comment = await prisma.comment_news.create({
              data: {
                ID_news: newsItem.id,
                ID_user: player2.id,
                content: "Bravo pour le lancement!",
                ID_parent: null,
              },
            });
            await prisma.like_comment.create({
              data: { ID_user: player1.id, ID_comment: comment.id },
            });
          }
        }
      }

      const teamName = `Team_${projet.id}`;
      let team = await prisma.team.findFirst({
        where: { name: teamName, ID_project: projet.id },
      });
      if (!team) {
        team = await prisma.team.create({
          data: {
            ID_project: projet.id,
            ID_creator: creator.id,
            name: teamName,
            description: "Description de la team",
            jobs: ["job-one", "job-two"],
            status: "OPEN",
          },
        });
      }

      for (const reviewer of [player1, player2]) {
        let review = await prisma.project_review.findFirst({
          where: { ID_project: projet.id, ID_author: reviewer.id },
        });
        if (!review) {
          review = await prisma.project_review.create({
            data: {
              ID_project: projet.id,
              ID_author: reviewer.id,
              rating: randomRating(),
              comment: `Avis de ${reviewer.email}`,
            },
          });
        }
        const likeRev = await prisma.like_review.findFirst({
          where: { ID_user: creator.id, ID_review: review.ID_review },
        });
        if (!likeRev) {
          await prisma.like_review.create({
            data: { ID_user: creator.id, ID_review: review.ID_review },
          });
        }
      }

      const followProj = await prisma.follow_project.findFirst({
        where: { ID_user: player1.id, ID_project: projet.id },
      });
      if (!followProj) {
        await prisma.follow_project.create({
          data: { ID_user: player1.id, ID_project: projet.id },
        });
      }
      const followCreator = await prisma.follow_creator.findFirst({
        where: { ID_user: player2.id, ID_creator: creator.id },
      });
      if (!followCreator) {
        await prisma.follow_creator.create({
          data: { ID_user: player2.id, ID_creator: creator.id },
        });
      }
    }
  }
}

main()
  .catch((e) => {
    console.error("Seeding error", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

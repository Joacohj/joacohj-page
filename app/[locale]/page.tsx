'use client'

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Header from "@/src/components/Header";
import { BasicMasonry } from "@/src/components/masonry";
import { ModeToggle } from "@/src/components/theme-changer";
import ImageOfMe from "@/public/images/me.png"
import { AvatarIcon, CalendarIcon, CaretDownIcon, DashboardIcon, DiscordLogoIcon, EnvelopeClosedIcon, GitHubLogoIcon, InstagramLogoIcon, LinkedInLogoIcon, PaperPlaneIcon, VideoIcon } from '@radix-ui/react-icons'
import { ImageIcon, Link2Icon } from "lucide-react";

import Image from "next/image";
import PaginationComponent from "@/src/components/Pagination";
import { SOCIAL_MEDIA } from "@/utils/constants";
import { DiReact } from "react-icons/di";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@base-ui/react/input";
import { Combobox } from "@/components/ui/combobox";
import ComboboxPopup from "@/src/components/ComboBox";
import { Textarea } from "@/components/ui/textarea";


import { motion, type Variants } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const badgeVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};
const articleVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 80,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeIn",
    },
  },
};

export default function Home() {
  const t = useTranslations('Hero')
  const tb = useTranslations('Hero.Badges')
  return (
    <div>
      <Header />
      <section className="hero w-full px-5 sm:px-15 xl:px-30 sm:mt-30 grid xl:grid-cols-[1fr_525px] sm:grid-cols-1 sm:gap-20">
        <article className="order-2 xl:order-1 w-full mt-10 flex flex-col xl:pr-20">

          <div className="w-full flex justify-between items-center text-foreground">
            <div className="font-mono text-sm flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-green-600"></div>
              <p className="font-extralight">{t('status')}</p>
            </div>

            <div className="flex gap-2">
              <Link href={SOCIAL_MEDIA.linkedin}><LinkedInLogoIcon width={25} height={25} className="text-foreground" /></Link>
              <Link href={SOCIAL_MEDIA.github}><GitHubLogoIcon width={25} height={25} className="text-foreground" /></Link>
            </div>
          </div>

          <div className="flex flex-col mt-5">
            <h3 className="font-semibold text-2xl sm:text-5xl">Joaquin Alvarez <span>/</span> Joacohj</h3>
            <motion.div
              className="flex text-sm gap-2 mt-5 flex-wrap"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                variants={badgeVariants}
                className="flex items-center justify-center px-4 py-1 rounded-md font-mono text-muted-foreground border border-accent"
              >
                <p>{tb('webDevelopment')}</p>
              </motion.div>

              <motion.div
                variants={badgeVariants}
                className="flex items-center justify-center px-4 py-1 rounded-md font-mono text-muted-foreground border border-accent"
              >
                <p>{tb('personalBlog')}</p>
              </motion.div>

              <motion.div
                variants={badgeVariants}
                className="flex items-center justify-center px-4 py-1 rounded-md font-mono text-muted-foreground border border-accent"
              >
                <p>{tb('portfolio')}</p>
              </motion.div>

              <motion.div
                variants={badgeVariants}
                className="flex items-center justify-center px-4 py-1 rounded-md font-mono text-muted-foreground border border-accent"
              >
                <p>{tb('fitnessCoach')}</p>
              </motion.div>
            </motion.div>
            <div className="w-full h-0.5 rounded-2xl mt-4 bg-accent"></div>
            <p className="pl-2 mt-5 line-clamp-8 text-pretty font-light leading-6.5">{t('presentation')}</p>
          </div>

          <Button className="sm:w-fit w-full px-20 py-6 mt-10">
            {t('contactSection')}
          </Button>
        </article>

        <article
          // variants={articleVariants}
          // initial="hidden"
          // animate="visible"
          className="order-1 xl:order-2 w-[300px] sm:w-[300px] flex xs:w-[300px] xl:w-[75%] h-[400px] sm:h-[450px] relative rounded-xl justify-self-center hover:scale-[100.8%] transition-all"
        >
          <Link href="/feed/stories">
            <div className="hidden sm:flex story-background opacity-80 shadow-2xl shadow-red-900 absolute inset-0 rotate-[20deg] rounded-4xl" />

            <div className="bg-accent absolute opacity-95 inset-0 overflow-hidden rounded-4xl">
              <Image
                loading="eager"
                src={ImageOfMe.src}
                className="w-full h-full object-cover"
                alt={t('avatarAlt')}
                width={1200}
                height={800}
              />
            </div>

            <p className="hidden sm:flex absolute z-30 -right-30 self-center top-0 bottom-0 rotate-90">
              <span className="text-foreground font-light flex items-center gap-1 underline decoration-2 decoration-accent hover:decoration-ring transition-all underline-offset-4 text-sm">
                <AvatarIcon />
                {t('stories')}
              </span>
            </p>
          </Link>
        </article>
      </section>
      <section className="w-full px-5 sm:px-15 xl:px-30 mt-40">
        <article className="flex flex-col my-5">
          <h4 id="gallery" className="text-2xl font-semibold sm:text-4xl">Gallery</h4>
          <p className="text-muted-foreground text-xl">Public/Multimedia/About me.</p>
          <Link href="/gallery/feed" className="mt-0.5  text-muted-foreground decoration-2 flex items-center"><p className="text-sm flex items-center gap-2 underline underline-offset-[6px] decoration-accent hover:decoration-ring transition-all">Click here to watch my entire feed <span className="-rotate-45"><Link2Icon width={15} height={15} /></span></p></Link>
        </article>

        <article className="w-full mt-10">
          <BasicMasonry />
        </article>

      </section>
      <section className="w-full px-5 sm:px-15 xl:px-30 my-40">
        <article className="flex flex-col my-5">
          <h4 id="blog" className="text-2xl font-semibold sm:text-4xl">My Blog Section</h4>
          <p className="text-muted-foreground text-xl">Follow my posts about every thoughts here.</p>
          <Link className="text-foreground text-2xl w-fit font-semibold" href={"/blog/posts/asasas"}><p>Joaquin Alvarez <span>|</span> <span className="underline-offset-[6px] underline decoration-accent hover:decoration-ring transition-all">@Joacohj</span></p></Link>
        </article>
        <div className="w-full mt-10">
          <article className="w-full xl:h-40 border-border border overflow-hidden rounded-xl bg-card grid xl:grid-cols-[1fr_250px]">
            <div className="order-2 xl-order-1 w-full px-10 py-5">
              <div className="xl:w-1/4">
                <Link href={"/blog/posts/asasas"} className="text-xl text-muted-foreground">Joaquin Alvarez Portfolio</Link>
                <div className="h-0.5 w-full bg-accent my-2"></div>
              </div>
              <p className="line-clamp-2 w-2/3 text-muted-foreground font-light ">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Tempora amet quam neque! Rerum ducimus voluptate obcaecati commodi officia neque eligendi voluptatem molestias in? Sit impedit eum itaque voluptate deserunt. Ad?</p>
            </div>
            <div className="order-1 xl:order-2 w-full h-[200px] xl:h-full bg-accent flex justify-center items-center rounded-xl border-border border shadow-sm" >
              <ImageIcon className="text-muted-foreground" />
            </div>
          </article>
        </div>

        <div className="my-20">
          <div className="w-2/3 mb-10">
            <p className="text-xl font-semibold">Posts</p>
            <p className="text-muted-foreground ">these are articles I&apos;ve written on technical subjects, I mostly cover web technologies and how design intertwines with our tools.</p>
          </div>
          <div className="flex flex-col gap-10">
            <article className="w-full min-h-40 border-border border overflow-hidden rounded-xl bg-card grid xl:grid-cols-[1fr_250px]">
              <div className="order-2 xl:order-1 w-full px-10 py-5">
                <div className="xl:w-1/4">
                  <Link href={""} className="text-xl text-muted-foreground">Joaquin Alvarez Portfolio</Link>
                  <div className="h-0.5 w-full bg-accent my-2"></div>
                </div>
                <time className="flex items-center gap-1.5 text-muted-foreground my-1"><span><CalendarIcon /></span>August 19th</time>
                <p className="line-clamp-1 w-2/3 text-muted-foreground font-light ">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Tempora amet quam neque! Rerum ducimus voluptate obcaecati commodi officia neque eligendi voluptatem molestias in? Sit impedit eum itaque voluptate deserunt. Ad?</p>
              </div>
              <div className="order-1 xl:order-2 w-full h-[200px] xl:h-full bg-accent flex justify-center items-center rounded-xl border-border border shadow-sm" >
                <ImageIcon className="text-muted-foreground" />
              </div>
            </article>
            <article className="w-full min-h-40 border-border border overflow-hidden rounded-xl bg-card grid xl:grid-cols-[1fr_250px]">
              <div className="order-2 xl:order-1 w-full px-10 py-5">
                <div className="xl:w-1/4">
                  <Link href={""} className="text-xl text-muted-foreground">Joaquin Alvarez Portfolio</Link>
                  <div className="h-0.5 w-full bg-accent my-2"></div>
                </div>
                <time className="flex items-center gap-1.5 text-muted-foreground my-1"><span><CalendarIcon /></span>August 19th</time>
                <p className="line-clamp-1 w-2/3 text-muted-foreground font-light ">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Tempora amet quam neque! Rerum ducimus voluptate obcaecati commodi officia neque eligendi voluptatem molestias in? Sit impedit eum itaque voluptate deserunt. Ad?</p>
              </div>
              <div className="order-1 xl:order-2 w-full h-[200px] xl:h-full bg-accent flex justify-center items-center rounded-xl border-border border shadow-sm" >
                <ImageIcon className="text-muted-foreground" />
              </div>
            </article>
            <PaginationComponent />
          </div>

        </div>
      </section>
      <section className="w-full px-5 sm:px-15 xl:px-30 my-40">
        <article className="flex flex-col my-5">
          <h4 id="projects" className="text-2xl font-semibold sm:text-4xl">Github Projects</h4>
          <p className="text-muted-foreground text-xl">Here are some of my best projects published on my GitHub page.</p>

          <Link className="text-foreground my-5 w-fit text-2xl font-semibold" href={SOCIAL_MEDIA.github}><p className="flex items-center gap-2"><span><GitHubLogoIcon width={20} height={20} /></span><span className="underline-offset-[6px] underline decoration-accent hover:decoration-ring transition-all">Joacohj</span></p></Link>


          <div className="w-2/4 ">
            <p className="line-clamp-3 font-light leading-6.5  text-foreground text-pretty">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Qui pariatur molestiae facere repellat voluptatem quidem dolorum eveniet eius beatae aliquid? Iure reprehenderit nihil a rerum est! Atque nobis quia repellendus.
              Sed repellat consequatur dolorum dignissimos culpa. Voluptate, autem harum aliquam repudiandae necessitatibus exercitationem reiciendis nihil commodi impedit consequatur, quasi ducimus ipsam ratione, laudantium unde vel quaerat eius minus magnam! Ex?</p>
          </div>

          <div className="hidden xl:flex justify-center items-center w-full mt-15">
            <div className="w-fit flex justify-center items-center my-15 -rotate-[10deg] hover:rotate-0 transition-transform">

              <div className="w-[450px] h-[600px] bg-black rounded-xl  relative shadow-2xl shadow-black">
                <div className="absolute  inset-0 rounded-xl overflow-hidden">
                  <img className="absolute inset-0 w-full rounded-xl  h-full object-cover opacity-60" src="https://images.unsplash.com/photo-1499002238440-d264edd596ec?auto=format&fit=crop&w=1200&h=900&q=80" />
                </div>
                <div className="w-[450px] px-10 py-10 min-h-[250px] flex flex-col shadow-2xl shadow-black transition-transform hover:rotate-0 bg-primary absolute  rounded-xl top-15 opacity-90 backdrop-blur-2xl rotate-30 -right-50 ">
                  <div className=" w-full flex justify-between text-primary-foreground">
                    <p className="text-2xl font-bold">Github Application</p>
                    <Link href={SOCIAL_MEDIA.github}><GitHubLogoIcon width={30} height={30} /></Link>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <time className="flex items-center text-primary-foreground gap-2 text-xl font-light">
                      <CalendarIcon /> August 29
                    </time>
                    <Link href={SOCIAL_MEDIA.github} className="flex gap-1 text-primary-foreground underline"><Link2Icon className="rotate-45" />https://githubapp.com</Link>
                  </div>
                  <div className="flex text-sm gap-2 mt-5 flex-wrap text-primary-foreground">
                    <div className="flex items-center justify-center px-4 py-1 rounded-md font-mono border border-accent">
                      <p className="flex items-center gap-1"> <DiReact width={20} height={20} /> React</p>
                    </div>
                    <div className="flex items-center justify-center px-4 py-1 rounded-md font-mono border border-accent">
                      <p>Tailwind</p>
                    </div>
                    <div className="flex items-center justify-center px-4 py-1 rounded-md font-mono border border-accent">
                      <p>BetterAuth</p>
                    </div>
                    <div className="flex items-center justify-center px-4 py-1 rounded-md font-mono border border-accent">
                      <p>Prisma</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </article>
      </section>

      <section className="w-full px-5 sm:px-15 xl:px-30 my-40 grid xl:grid-cols-[1fr_550px]">
        <article className="flex flex-col my-5">
          <h4 id="contact" className="text-2xl font-semibold sm:text-4xl">Contact Me!</h4>
          <p className="text-muted-foreground text-xl font-light">Lorem ipsum dolor sit amet consectetur adipisicing elit. Praesentium amet aliquid inventore fugit nihil ratione obcaecati rerum nisi voluptate</p>
          <div className="mt-10 flex flex-col gap-10 text-foreground">
            <address className="font-light text-muted-foreground text-xl">joaquin.alvarez.99@gmail.com</address>
            <p className="text-muted-foreground text-xl font-extralight"><span className="font-semibold ">+598 </span>098 56 10 82</p>

            <div className="flex flex-wrap gap-5 w-2/3">
              <Link className="flex items-center gap-1 text-muted-foreground font-light text-xl" href={SOCIAL_MEDIA.instagram}><InstagramLogoIcon className="text-foreground" width={20} height={20} />@pinia_patada</Link>
              <Link className="flex items-center gap-1 text-muted-foreground font-light text-xl" href={SOCIAL_MEDIA.discord}><DiscordLogoIcon className="text-foreground" width={20} height={20} />Joacohj Community</Link>
              <Link className="flex items-center gap-1 text-muted-foreground font-light text-xl" href={SOCIAL_MEDIA.youtube}><VideoIcon className="text-foreground" width={20} height={20} />@Joacohj</Link>
              <Link className="flex items-center gap-1 text-muted-foreground font-light text-xl" href={SOCIAL_MEDIA.linkedin}><LinkedInLogoIcon className="text-foreground" width={20} height={20} />Joaquin Alvarez</Link>
              <Link className="flex items-center gap-1 text-muted-foreground font-light text-xl" href={SOCIAL_MEDIA.github}><GitHubLogoIcon className="text-foreground" width={20} height={20} />@Joacohj</Link>

            </div>
          </div>
          <div className="grid sm:grid-cols-2  w-full justify-between my-20 gap-10 ">
            <div className="w-full">
              <p className="text-xl text-foreground font-semibold mb-4">FeedBack and Suggestions</p>
              <p className="text-muted-foreground text-xl font-extralight text-pretty">Lorem ipsum dolor sit amet consectetur adipisicing elit. Praesentium amet aliquid inventore fugit nihil ratione obcaecati rerum nisi voluptate</p>
            </div>
            <div className="w-full">
              <p className="text-xl text-foreground font-semibold mb-4">Subscribe to my Newsleeter</p>
              <p className="text-muted-foreground text-xl font-extralight text-pretty mb-2">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Repudiandae, molestiae?</p>
              <InputGroup className="w-fit py-5">
                <InputGroupInput placeholder="Email" />
                <InputGroupAddon>
                  <EnvelopeClosedIcon />
                </InputGroupAddon>
                <InputGroupAddon align={"inline-end"}>
                  <InputGroupButton>
                    <PaperPlaneIcon />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </div>
          </div>
        </article>
        <article className="xl:border-l xl:pl-15 border-accent my-5 w-full">
          <p className="text-xl font-semibold text-foreground">Get in Touch</p>
          <p className="text-muted-foreground font-light">You can reach me anytime</p>
          <form action="">
            <FieldGroup className="w-full mt-10">
              <FieldGroup>
                <FieldSet className="grid grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="first-name">First Name</FieldLabel>
                    <InputGroup className="py-5">
                      <InputGroupInput type="text" id="first-name" placeholder="Jhon" />
                    </InputGroup>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="last-name">Last Name</FieldLabel>
                    <InputGroup className="py-5">
                      <InputGroupInput type="text" id="last-name" placeholder="Lee" />
                    </InputGroup>
                  </Field>
                </FieldSet>
              </FieldGroup>
              <Field>
                <FieldSet>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <InputGroup className="py-5">
                    <InputGroupInput id="email" placeholder="jhondoe@example.com" />
                    <InputGroupAddon>
                      <EnvelopeClosedIcon />
                    </InputGroupAddon>
                  </InputGroup>
                </FieldSet>
              </Field>
              <Field>
                <FieldSet>
                  <FieldLabel htmlFor="phone">Phone</FieldLabel>
                  <InputGroup className="py-5">
                    <InputGroupInput className="" id="phone" placeholder="Phone Number" />
                    <InputGroupAddon className="">
                      <DropdownMenu>
                        <DropdownMenuTrigger className='flex px-2 items-center'>
                          <p>+598</p>
                          <CaretDownIcon />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <a className="w-full" href="#">Gallery</a>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <a className="w-full" href="#">Blog section</a>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <a className="w-full" href="#">Projects</a>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <a className="w-full" href="#">Contact</a>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </InputGroupAddon>
                  </InputGroup>
                </FieldSet>
              </Field>
              <Field>
                <FieldSet>
                  <FieldLabel htmlFor="message">Message</FieldLabel>
                  <Textarea id="message" className="resize-none h-25" placeholder="How can i help you?"></Textarea>
                </FieldSet>
              </Field>
              <Button className=" flex items-center gap-2 w-full px-20 py-6 mt-10">
                Send Message
                <PaperPlaneIcon />
              </Button>

              <p className="w-full text-center text-xs text-muted-foreground font-light">By contacting me, you agree the <span className="font-semibold">Terms of service</span> and <span className="font-semibold">Privacy Policy</span>. </p>
            </FieldGroup>
          </form>
        </article>
      </section>


      <footer className="w-full bg-background border-accent border py-10">
        <p className="text-center  text-muted-foreground">Made with love by Joaquin Alvarez ❤</p>
        <nav className="flex w-full justify-center gap-4 text-muted-foreground">
          <a href="">about</a>
          <a href="">gallery</a>
          <a href="">blog</a>
          <a href="">projects</a>
        </nav>
      </footer>
    </div>
  );
}

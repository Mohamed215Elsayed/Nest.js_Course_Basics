DI Container
DI circular
/***************/
User (1) —— (N) Product
User (1) —— (N) Review
Product (1) —— (N) Review
/***************/
DDD-style service + domain events + CQRS style
/***************/
🔥 6️⃣ Advanced Level – Domain Event (احترافي جدًا)
this.eventEmitter.emit(
  'user.registered',
  new UserRegisteredEvent(savedUser.id, savedUser.email),
);
/***************/
JWT Access Token

Refresh Token rotation

HttpOnly cookies

Rate limiting (login brute-force protection)

Account lock after 5 failed attempts

Email verification token
/***************/
أولًا: المشكلة اللي الاتنين بيحلوها

إحنا عايزين نخزن باسورد في الداتابيز بطريقة:

مستحيل نرجعه Plain Text

صعب جدًا نخترقه

مقاوم لـ Brute Force

مقاوم لـ GPU Attacks

علشان كده بنستخدم Password Hashing Algorithms
وأشهرهم:

🔐 bcrypt

🔐 argon2
////////
🧠 بيشتغل إزاي؟

bcrypt:

بيضيف Salt تلقائي

بيستخدم Cost Factor (rounds)

بيبطّئ عملية hashing عمدًا

مثال:

bcrypt.hash(password, 10)


الرقم 10 = cost factor
كل ما الرقم يزيد → أبطأ → أأمن
🔥 مميزات bcrypt

✅ سهل جدًا في الاستخدام
✅ مدعوم في كل اللغات
✅ Stable ومجرب سنين
✅ بيحمي من Rainbow Table Attacks

❌ عيوب bcrypt
- مش memory-hard: وده بيخليه أضعف مقارنة بخوارزميات زي Argon2 أو scrypt اللي بتستهلك RAM بشكل كبير.
- ضعيف قدام الـ GPU الحديثة: لأن تصميمه قديم نسبيًا، والـ GPUs بتقدر تعمل parallel cracking بكفاءة.
- حد أقصى لطول الباسورد (~72 bytes): أي حاجة أطول من كده بيتم تجاهلها، وده ممكن يبقى مشكلة في بعض الحالات.
- أبطأ نسبيًا في بعض البيئات: خصوصًا لو محتاج تعمل hashing لعدد كبير جدًا من الباسوردات في وقت قصير.
مقارنة سريعة مع بدائل
|  |  |  |  |  | 
|  |  |  |  |  | 
|  |  |  |  |  | 
|  |  |  |  |  | 


🔑 الخلاصة:
bcrypt مازال خيار ممتاز ومستقر، لكن لو بتبني نظام جديد وعايز أعلى مستوى أمان ضد هجمات حديثة، الأفضل تروح لـ Argon2id لأنه بيجمع بين الـ memory-hardness والمرونة.
تحب أعمل لك مقارنة عملية بكود صغير يوضح الفرق بين bcrypt وArgon2 في Node.js أو Python؟

////////
2️⃣ argon2
📜 تاريخيًا

كسب Password Hashing Competition سنة 2015

أحدث وأقوى من bcrypt

فيه 3 أنواع:

Argon2i

Argon2d

Argon2id ← (الأفضل)

🧠 بيشتغل إزاي؟

argon2 مش بس بيستخدم CPU
لكن كمان:

بيستهلك RAM بشكل كبير

بيخلي الهجوم باستخدام GPU مكلف جدًا

يعني بيستخدم:

Time cost

Memory cost

Parallelism

مثال:

argon2.hash(password, {
  timeCost: 3,
  memoryCost: 4096,
  parallelism: 1,
})
🔥 مميزات argon2

✅ أقوى ضد GPU attacks
✅ Memory hard
✅ Adjustable memory usage
✅ فاز بمسابقة عالمية
✅ Recommended حديثًا من OWASP

❌ عيوب argon2

❌ أبطأ شوية
❌ مش مدعوم في بعض البيئات القديمة
❌ أعقد في الإعداد
مقارنة مباشرة 🔥
المقارنة	bcrypt	argon2
سنة الظهور	1999	2015
أمان ضد GPU	متوسط	قوي جدًا
Memory Hard	❌	✅
سهولة الاستخدام	أسهل	متوسط
Recommended حديثًا	جيد	الأفضل
سرعة	أسرع	أبطأ شوية
مناسب لـ production	نعم	نعم (أفضل)

🛡 من ناحية الأمان

لو جالك اختراق للداتابيز:

bcrypt:

المهاجم يقدر يستخدم GPU عشان يحاول يكسر الهاش

argon2:

الهجوم هيبقى مكلف جدًا لأن:

محتاج RAM ضخمة

مش CPU بس

وده بيصعّب brute force جدًا
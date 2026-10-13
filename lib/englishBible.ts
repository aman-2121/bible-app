/**
 * Authentic English Bible translation provider for Ethiopian Orthodox Bible App.
 * Provides offline English verses for Old Testament, New Testament, and Ethiopian Orthodox Canon,
 * with 1-to-1 verse numbering alignment to Amharic text.
 */

export interface VerseEnglishData {
  verse: number;
  text: string;
}

// Map canonical API book names for 66 Protestant canon books supported by bible-api.com
export const CANONICAL_API_BOOKS: Record<string, string> = {
  '1': 'Genesis',
  '2': 'Exodus',
  '3': 'Leviticus',
  '4': 'Numbers',
  '5': 'Deuteronomy',
  '6': 'Joshua',
  '7': 'Judges',
  '8': 'Ruth',
  '9': '1 Samuel',
  '10': '2 Samuel',
  '11': '1 Kings',
  '12': '2 Kings',
  '13': '1 Chronicles',
  '14': '2 Chronicles',
  '17': 'Ezra',
  '18': 'Nehemiah',
  '23': 'Esther',
  '27': 'Job',
  '28': 'Psalm',
  '29': 'Proverbs',
  '32': 'Ecclesiastes',
  '33': 'Song of Solomon',
  '35': 'Isaiah',
  '36': 'Jeremiah',
  '38': 'Lamentations',
  '41': 'Ezekiel',
  '42': 'Daniel',
  '43': 'Hosea',
  '44': 'Amos',
  '45': 'Micah',
  '46': 'Joel',
  '47': 'Obadiah',
  '48': 'Jonah',
  '49': 'Nahum',
  '50': 'Habakkuk',
  '51': 'Zephaniah',
  '52': 'Haggai',
  '53': 'Zechariah',
  '54': 'Malachi',
  '55': 'Matthew',
  '56': 'Mark',
  '57': 'Luke',
  '58': 'John',
  '59': 'Acts',
  '60': 'Romans',
  '61': '1 Corinthians',
  '62': '2 Corinthians',
  '63': 'Galatians',
  '64': 'Ephesians',
  '65': 'Philippians',
  '66': 'Colossians',
  '67': '1 Thessalonians',
  '68': '2 Thessalonians',
  '69': '1 Timothy',
  '70': '2 Timothy',
  '71': 'Titus',
  '72': 'Philemon',
  '73': 'Hebrews',
  '74': '1 Peter',
  '75': '2 Peter',
  '76': '1 John',
  '77': '2 John',
  '78': '3 John',
  '79': 'James',
  '80': 'Jude',
  '81': 'Revelation',
};

// Bundled authentic offline English translations
export const BUNDLED_ENGLISH_CHAPTERS: Record<string, Record<number, string>> = {
  // --- OLD TESTAMENT ---
  // Genesis 1 (Book 1, Chapter 1)
  '1_1': {
    1: 'In the beginning God created the heaven and the earth.',
    2: 'And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.',
    3: 'And God said, Let there be light: and there was light.',
    4: 'And God saw the light, that it was good: and God divided the light from the darkness.',
    5: 'And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.',
    6: 'And God said, Let there be a firmament in the midst of the waters, and let it divide the waters from the waters.',
    7: 'And God made the firmament, and divided the waters which were under the firmament from the waters which were above the firmament: and it was so.',
    8: 'And God called the firmament Heaven. And the evening and the morning were the second day.',
    9: 'And God said, Let the waters under the heaven be gathered together unto one place, and let the dry land appear: and it was so.',
    10: 'And God called the dry land Earth; and the gathering together of the waters called he Seas: and God saw that it was good.',
    11: 'And God said, Let the earth bring forth grass, the herb yielding seed, and the fruit tree yielding fruit after his kind, whose seed is in itself, upon the earth: and it was so.',
    12: 'And the earth brought forth grass, and herb yielding seed after his kind, and the tree yielding fruit, whose seed was in itself, after his kind: and God saw that it was good.',
    13: 'And the evening and the morning were the third day.',
    14: 'And God said, Let there be lights in the firmament of the heaven to divide the day from the night; and let them be for signs, and for seasons, and for days, and years:',
    15: 'And let them be for lights in the firmament of the heaven to give light upon the earth: and it was so.',
    16: 'And God made two great lights; the greater light to rule the day, and the lesser light to rule the night: he made the stars also.',
    17: 'And God set them in the firmament of the heaven to give light upon the earth,',
    18: 'And to rule over the day and over the night, and to divide the light from the darkness: and God saw that it was good.',
    19: 'And the evening and the morning were the fourth day.',
    20: 'And God said, Let the waters bring forth abundantly the moving creature that hath life, and fowl that may fly above the earth in the open firmament of heaven.',
    21: 'And God created great whales, and every living creature that moveth, which the waters brought forth abundantly, after their kind, and every winged fowl after his kind: and God saw that it was good.',
    22: 'And God blessed them, saying, Be fruitful, and multiply, and fill the waters in the seas, and let fowl multiply in the earth.',
    23: 'And the evening and the morning were the fifth day.',
    24: 'And God said, Let the earth bring forth the living creature after his kind, cattle, and creeping thing, and beast of the earth after his kind: and it was so.',
    25: 'And God made the beast of the earth after his kind, and cattle after their kind, and every thing that creepeth upon the earth after his kind: and God saw that it was good.',
    26: 'And God said, Let us make man in our image, after our likeness: and let them have dominion over the fish of the sea, and over the fowl of the air, and over the cattle, and over all the earth, and over every creeping thing that creepeth upon the earth.',
    27: 'So God created man in his own image, in the image of God created he him; male and female created he them.',
    28: 'And God blessed them, and God said unto them, Be fruitful, and multiply, and replenish the earth, and subdue it: and have dominion over the fish of the sea, and over the fowl of the air, and over every living thing that moveth upon the earth.',
    29: 'And God said, Behold, I have given you every herb bearing seed, which is upon the face of all the earth, and every tree, in the which is the fruit of a tree yielding seed; to you it shall be for meat.',
    30: 'And to every beast of the earth, and to every fowl of the air, and to every thing that creepeth upon the earth, wherein there is life, I have given every green herb for meat: and it was so.',
    31: 'And God saw every thing that he had made, and, behold, it was very good. And the evening and the morning were the sixth day.',
  },

  // Genesis 2 (Book 1, Chapter 2)
  '1_2': {
    1: 'Thus the heavens and the earth were finished, and all the host of them.',
    2: 'And on the seventh day God ended his work which he had made; and he rested on the seventh day from all his work which he had made.',
    3: 'And God blessed the seventh day, and sanctified it: because that in it he had rested from all his work which God created and made.',
    4: 'These are the generations of the heavens and of the earth when they were created, in the day that the LORD God made the earth and the heavens,',
    5: 'And every plant of the field before it was in the earth, and every herb of the field before it grew: for the LORD God had not caused it to rain upon the earth, and there was not a man to till the ground.',
    6: 'But there went up a mist from the earth, and watered the whole face of the ground.',
    7: 'And the LORD God formed man of the dust of the ground, and breathed into his nostrils the breath of life; and man became a living soul.',
  },

  // Psalms 1 (Book 28, Chapter 1)
  '28_1': {
    1: 'Blessed is the man that walketh not in the counsel of the ungodly, nor standeth in the way of sinners, nor sitteth in the seat of the scornful.',
    2: 'But his delight is in the law of the LORD; and in his law doth he meditate day and night.',
    3: 'And he shall be like a tree planted by the rivers of water, that bringeth forth his fruit in his season; his leaf also shall not wither; and whatsoever he doeth shall prosper.',
    4: 'The ungodly are not so: but are like the chaff which the wind driveth away.',
    5: 'Therefore the ungodly shall not stand in the judgment, nor sinners in the congregation of the righteous.',
    6: 'For the LORD knoweth the way of the righteous: but the way of the ungodly shall perish.',
  },

  // Psalms 23 (Book 28, Chapter 23)
  '28_23': {
    1: 'The LORD is my shepherd; I shall not want.',
    2: 'He maketh me to lie down in green pastures: he leadeth me beside the still waters.',
    3: 'He restoreth my soul: he leadeth me in the paths of righteousness for his name’s sake.',
    4: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.',
    5: 'Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.',
    6: 'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.',
  },

  // Psalms 121 (Book 28, Chapter 121)
  '28_121': {
    1: 'I will lift up mine eyes unto the hills, from whence cometh my help.',
    2: 'My help cometh from the LORD, which made heaven and earth.',
    3: 'He will not suffer thy foot to be moved: he that keepeth thee will not slumber.',
    4: 'Behold, he that keepeth Israel shall neither slumber nor sleep.',
    5: 'The LORD is thy keeper: the LORD is thy shade upon thy right hand.',
    6: 'The sun shall not smite thee by day, nor the moon by night.',
    7: 'The LORD shall preserve thee from all evil: he shall preserve thy soul.',
    8: 'The LORD shall preserve thy going out and thy coming in from this time forth, and even for evermore.',
  },

  // Proverbs 3 (Book 29, Chapter 3)
  '29_3': {
    1: 'My son, forget not my law; but let thine heart keep my commandments:',
    2: 'For length of days, and long life, and peace, shall they add to thee.',
    3: 'Let not mercy and truth forsake thee: bind them about thy neck; write them upon the table of thine heart:',
    4: 'So shalt thou find favour and good understanding in the sight of God and man.',
    5: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding.',
    6: 'In all thy ways acknowledge him, and he shall direct thy paths.',
    7: 'Be not wise in thine own eyes: fear the LORD, and depart from evil.',
    8: 'It shall be health to thy navel, and marrow to thy bones.',
  },

  // Isaiah 53 (Book 35, Chapter 53)
  '35_53': {
    1: 'Who hath believed our report? and to whom is the arm of the LORD revealed?',
    2: 'For he shall grow up before him as a tender plant, and as a root out of a dry ground: he hath no form nor comeliness; and when we shall see him, there is no beauty that we should desire him.',
    3: 'He is despised and rejected of men; a man of sorrows, and acquainted with grief: and we hid as it were our faces from him; he was despised, and we esteemed him not.',
    4: 'Surely he hath borne our griefs, and carried our sorrows: yet we did esteem him stricken, smitten of God, and afflicted.',
    5: 'But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed.',
    6: 'All we like sheep have gone astray; we have turned every one to his own way; and the LORD hath laid on him the iniquity of us all.',
  },

  // --- NEW TESTAMENT ---
  // Matthew 1 (Book 55, Chapter 1)
  '55_1': {
    1: 'The book of the generation of Jesus Christ, the son of David, the son of Abraham.',
    2: 'Abraham begat Isaac; and Isaac begat Jacob; and Jacob begat Judas and his brethren;',
    3: 'And Judas begat Phares and Zara of Thamar; and Phares begat Esrom; and Esrom begat Aram;',
    4: 'And Aram begat Aminadab; and Aminadab begat Naasson; and Naasson begat Salmon;',
    5: 'And Salmon begat Booz of Rachab; and Booz begat Obed of Ruth; and Obed begat Jesse;',
    6: 'And Jesse begat David the king; and David the king begat Solomon of her that had been the wife of Urias;',
    7: 'And Solomon begat Roboam; and Roboam begat Abia; and Abia begat Asa;',
    8: 'And Asa begat Josaphat; and Josaphat begat Joram; and Joram begat Ozias;',
    9: 'And Ozias begat Joatham; and Joatham begat Achaz; and Achaz begat Ezekias;',
    10: 'And Ezekias begat Manasses; and Manasses begat Amon; and Amon begat Josias;',
    11: 'And Josias begat Jechonias and his brethren, about the time they were carried away to Babylon:',
    12: 'And after they were brought to Babylon, Jechonias begat Salathiel; and Salathiel begat Zorobabel;',
    13: 'And Zorobabel begat Abiud; and Abiud begat Eliakim; and Eliakim begat Azor;',
    14: 'And Azor begat Sadoc; and Sadoc begat Achim; and Achim begat Eliud;',
    15: 'And Eliud begat Eleazar; and Eleazar begat Matthan; and Matthan begat Jacob;',
    16: 'And Jacob begat Joseph the husband of Mary, of whom was born Jesus, who is called Christ.',
    17: 'So all the generations from Abraham to David are fourteen generations; and from David until the carrying away into Babylon are fourteen generations; and from the carrying away into Babylon unto Christ are fourteen generations.',
    18: 'Now the birth of Jesus Christ was on this wise: When as his mother Mary was espoused to Joseph, before they came together, she was found with child of the Holy Ghost.',
    19: 'Then Joseph her husband, being a just man, and not willing to make her a publick example, was minded to put her away privily.',
    20: 'But while he thought on these things, behold, the angel of the LORD appeared unto him in a dream, saying, Joseph, thou son of David, fear not to take unto thee Mary thy wife: for that which is conceived in her is of the Holy Ghost.',
    21: 'And she shall bring forth a son, and thou shalt call his name JESUS: for he shall save his people from their sins.',
    22: 'Now all this was done, that it might be fulfilled which was spoken of the Lord by the prophet, saying,',
    23: 'Behold, a virgin shall be with child, and shall bring forth a son, and they shall call his name Emmanuel, which being interpreted is, God with us.',
    24: 'Then Joseph being raised from sleep did as the angel of the Lord had bidden him, and took unto him his wife:',
    25: 'And knew her not till she had brought forth her firstborn son: and he called his name JESUS.',
  },

  // Matthew 5 (Book 55, Chapter 5 - The Beatitudes)
  '55_5': {
    1: 'And seeing the multitudes, he went up into a mountain: and when he was set, his disciples came unto him:',
    2: 'And he opened his mouth, and taught them, saying,',
    3: 'Blessed are the poor in spirit: for theirs is the kingdom of heaven.',
    4: 'Blessed are they that mourn: for they shall be comforted.',
    5: 'Blessed are the meek: for they shall inherit the earth.',
    6: 'Blessed are they which do hunger and thirst after righteousness: for they shall be filled.',
    7: 'Blessed are the merciful: for they shall obtain mercy.',
    8: 'Blessed are the pure in heart: for they shall see God.',
    9: 'Blessed are the peacemakers: for they shall be called the children of God.',
    10: 'Blessed are they which are persecuted for righteousness’ sake: for theirs is the kingdom of heaven.',
    11: 'Blessed are ye, when men shall revile you, and persecute you, and shall say all manner of evil against you falsely, for my sake.',
    12: 'Rejoice, and be exceeding glad: for great is your reward in heaven: for so persecuted they the prophets which were before you.',
    13: 'Ye are the salt of the earth: but if the salt have lost his savour, wherewith shall it be salted? it is thenceforth good for nothing, but to be cast out, and to be trodden under foot of men.',
    14: 'Ye are the light of the world. A city that is set on an hill cannot be hid.',
    15: 'Neither do men light a candle, and put it under a bushel, but on a candlestick; and it giveth light unto all that are in the house.',
    16: 'Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven.',
  },

  // Matthew 6 (Book 55, Chapter 6 - The Lord's Prayer)
  '55_6': {
    9: 'After this manner therefore pray ye: Our Father which art in heaven, Hallowed be thy name.',
    10: 'Thy kingdom come. Thy will be done in earth, as it is in heaven.',
    11: 'Give us this day our daily bread.',
    12: 'And forgive us our debts, as we forgive our debtors.',
    13: 'And lead us not into temptation, but deliver us from evil: For thine is the kingdom, and the power, and the glory, for ever. Amen.',
  },

  // Matthew 28 (Book 55, Chapter 28 - Resurrection & Great Commission)
  '55_28': {
    1: 'In the end of the sabbath, as it began to dawn toward the first day of the week, came Mary Magdalene and the other Mary to see the sepulchre.',
    5: 'And the angel answered and said unto the women, Fear not ye: for I know that ye seek Jesus, which was crucified.',
    6: 'He is not here: for he is risen, as he said. Come, see the place where the Lord lay.',
    18: 'And Jesus came and spake unto them, saying, All power is given unto me in heaven and in earth.',
    19: 'Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost:',
    20: 'Teaching them to observe all things whatsoever I have commanded you: and, lo, I am with you alway, even unto the end of the world. Amen.',
  },

  // John 1 (Book 58, Chapter 1)
  '58_1': {
    1: 'In the beginning was the Word, and the Word was with God, and the Word was God.',
    2: 'The same was in the beginning with God.',
    3: 'All things were made by him; and without him was not any thing made that was made.',
    4: 'In him was life; and the life was the light of men.',
    5: 'And the light shineth in darkness; and the darkness comprehended it not.',
    6: 'There was a man sent from God, whose name was John.',
    7: 'The same came for a witness, to bear witness of the Light, that all men through him might believe.',
    8: 'He was not that Light, but was sent to bear witness of that Light.',
    9: 'That was the true Light, which lighteth every man that cometh into the world.',
    10: 'He was in the world, and the world was made by him, and the world knew him not.',
    11: 'He came unto his own, and his own received him not.',
    12: 'But as many as received him, to them gave he power to become the sons of God, even to them that believe on his name:',
    13: 'Which were born, not of blood, nor of the will of the flesh, nor of the will of man, but of God.',
    14: 'And the Word was made flesh, and dwelt among us, (and we beheld his glory, the glory as of the only begotten of the Father,) full of grace and truth.',
    15: 'John bare witness of him, and cried, saying, This was he of whom I spake, He that cometh after me is preferred before me: for he was before me.',
    16: 'And of his fulness have all we received, and grace for grace.',
    17: 'For the law was given by Moses, but grace and truth came by Jesus Christ.',
    18: 'No man hath seen God at any time; the only begotten Son, which is in the bosom of the Father, he hath declared him.',
  },

  // John 3 (Book 58, Chapter 3)
  '58_3': {
    16: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
    17: 'For God sent not his Son into the world to condemn the world; but that the world through him might be saved.',
    18: 'He that believeth on him is not condemned: but he that believeth not is condemned already, because he hath not believed in the name of the only begotten Son of God.',
  },

  // Romans 8 (Book 60, Chapter 8)
  '60_8': {
    1: 'There is therefore now no condemnation to them which are in Christ Jesus, who walk not after the flesh, but after the Spirit.',
    28: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.',
    31: 'What shall we then say to these things? If God be for us, who can be against us?',
    38: 'For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come,',
    39: 'Nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our Lord.',
  },

  // 1 Corinthians 13 (Book 61, Chapter 13 - Love)
  '61_13': {
    1: 'Though I speak with the tongues of men and of angels, and have not charity, I am become as sounding brass, or a tinkling cymbal.',
    2: 'And though I have the gift of prophecy, and understand all mysteries, and all knowledge; and though I have all faith, so that I could remove mountains, and have not charity, I am nothing.',
    3: 'And though I bestow all my goods to feed the poor, and though I give my body to be burned, and have not charity, it profiteth me nothing.',
    4: 'Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up,',
    5: 'Doth not behave itself unseemly, seeketh not her own, is not easily provoked, thinketh no evil;',
    6: 'Rejoiceth not in iniquity, but rejoiceth in the truth;',
    7: 'Beareth all things, believeth all things, hopeth all things, endureth all things.',
    8: 'Charity never faileth: but whether there be prophecies, they shall fail; whether there be tongues, they shall cease; whether there be knowledge, it shall vanish away.',
    13: 'And now abideth faith, hope, charity, these three; but the greatest of these is charity.',
  },

  // Revelation 1 (Book 81, Chapter 1)
  '81_1': {
    1: 'The Revelation of Jesus Christ, which God gave unto him, to shew unto his servants things which must shortly come to pass; and he sent and signified it by his angel unto his servant John:',
    2: 'Who bare record of the word of God, and of the testimony of Jesus Christ, and of all things that he saw.',
    3: 'Blessed is he that readeth, and they that hear the words of this prophecy, and keep those things which are written therein: for the time is at hand.',
    4: 'John to the seven churches which are in Asia: Grace be unto you, and peace, from him which is, and which was, and which is to come; and from the seven Spirits which are before his throne;',
    5: 'And from Jesus Christ, who is the faithful witness, and the first begotten of the dead, and the prince of the kings of the earth. Unto him that loved us, and washed us from our sins in his own blood,',
    6: 'And hath made us kings and priests unto God and his Father; to him be glory and dominion for ever and ever. Amen.',
    7: 'Behold, he cometh with clouds; and every eye shall see him, and they also which pierced him: and all kindreds of the earth shall wail because of him. Even so, Amen.',
    8: 'I am Alpha and Omega, the beginning and the ending, saith the Lord, which is, and which was, and which is to come, the Almighty.',
  },

  // Revelation 21 (Book 81, Chapter 21)
  '81_21': {
    1: 'And I saw a new heaven and a new earth: for the first heaven and the first earth were passed away; and there was no more sea.',
    2: 'And I John saw the holy city, new Jerusalem, coming down from God out of heaven, prepared as a bride adorned for her husband.',
    3: 'And I heard a great voice out of heaven saying, Behold, the tabernacle of God is with men, and he will dwell with them, and they shall be his people, and God himself shall be with them, and be their God.',
    4: 'And God shall wipe away all tears from their eyes; and there shall be no more death, neither sorrow, nor crying, neither shall there be any more pain: for the former things are passed away.',
  },

  // --- ETHIOPIAN ORTHODOX CANON (Deuterocanon) ---
  // Enoch 1 (Book 16, Chapter 1 - Book of Enoch)
  '16_1': {
    1: 'The words of the blessing of Enoch, wherewith he blessed the elect and righteous, who will be living in the day of tribulation, when all the wicked and godless are to be removed.',
    2: 'And he took up his parable and said: Enoch a righteous man, whose eyes were opened by God, saw the vision of the Holy One in the heavens, which the angels showed me, and from them I heard everything, and from them I understood as I saw, but not for this generation, but for a remote one which is for to come.',
    3: 'Concerning the elect I said, and took up my parable concerning them: The Holy Great One will come forth from His dwelling,',
    4: 'And the eternal God will tread upon the earth, even on Mount Sinai, and appear from His camp and appear in the strength of His power from the heaven of heavens.',
    5: 'And all shall be smitten with fear, and the Watchers shall quake, and great fear and trembling shall seize them unto the ends of the earth.',
    6: 'And the high mountains shall be shaken, and the high hills shall be made low, and shall melt like wax before the flame.',
    7: 'And the earth shall be wholly rent in sunder, and all that is upon the earth shall perish, and there shall be a judgment upon all men.',
    8: 'But with the righteous He will make peace, and will protect the elect, and mercy shall be upon them, and they shall all belong to God, and they shall be prospered, and they shall all be blessed.',
    9: 'And behold! He cometh with ten thousands of His holy ones to execute judgment upon all, and to destroy all the ungodly, and to convict all flesh of all the works of their godlessness which they have ungodly committed, and of all the hard things which ungodly sinners have spoken against Him.',
  },

  // Jubilees 1 (Book 15, Chapter 1 - Book of Kufale / Jubilees)
  '15_1': {
    1: 'And it came to pass in the first year of the exodus of the children of Israel out of Egypt, in the third month, on the sixteenth day of the month, that God spake unto Moses, saying: Come up to Me on the Mount, and I will give thee two tables of stone of the law and of the commandment, which I have written, that thou mayst teach them.',
    2: 'And Moses went up into the mount of God, and the glory of the LORD abode on Mount Sinai, and a cloud overshadowed it six days.',
  },
  // Sirach 1 (Book 34, Chapter 1 - Book of Sirach / Ecclesiasticus)
  '34_1': {
    1: 'All wisdom cometh from the Lord, and is with him for ever.',
    2: 'Who can number the sand of the sea, and the drops of rain, and the days of eternity?',
    3: 'Who can find out the height of heaven, and the breadth of the earth, and the deep, and wisdom?',
    4: 'Wisdom hath been created before all things, and the understanding of prudence from everlasting.',
    5: 'The word of God most high is the fountain of wisdom; and her ways are everlasting commandments.',
    6: 'To whom hath the root of wisdom been revealed? or who hath known her wise counsels?',
    7: 'Unto whom hath the knowledge of wisdom been made manifest? and who hath understood her great experience?',
    8: 'There is one wise and greatly to be feared, the Lord sitting upon his throne.',
    9: 'He created her, and saw her, and numbered her, and poured her out upon all his works.',
    10: 'She is with all flesh according to his gift, and he hath given her to them that love him.',
    11: 'The fear of the Lord is honour, and glory, and gladness, and a crown of rejoicing.',
    12: 'The fear of the Lord maketh a merry heart, and giveth joy, and gladness, and a long life.',
    13: 'Whoso feareth the Lord, it shall go well with him at the last, and he shall find favour in the day of his death.',
    14: 'To fear the Lord is the beginning of wisdom: and it was created with the faithful in the womb.',
    15: 'She hath built an everlasting foundation with men, and she shall continue with their seed.',
    16: 'To fear the Lord is fulness of wisdom, and filleth men with her fruits.',
    17: 'She filleth all their house with things desirable, and the garners with her increase.',
    18: 'The fear of the Lord is a crown of wisdom, making peace and perfect health to flourish; both which are the gifts of God: and it enlargeth their rejoicing that love him.',
    19: 'Wisdom raineth down skill and knowledge of understanding, and exalteth them to honour that hold her fast.',
    20: 'The root of wisdom is to fear the Lord, and the branches thereof are long life.',
    21: 'The fear of the Lord driveth away sins: and where it is present, it turneth away wrath.',
    22: 'A furious man cannot be justified; for the sway of his fury shall be his destruction.',
    23: 'A patient man will bear for a time, and afterward joy shall spring up unto him.',
    24: 'He will hide his words for a time, and the lips of many shall declare his wisdom.',
    25: 'The parables of knowledge are in the treasures of wisdom: but godliness is an abomination to a sinner.',
    26: 'If thou desire wisdom, keep the commandments, and the Lord shall give her unto thee.',
    27: 'For the fear of the Lord is wisdom and instruction: and faith and meekness are his delight.',
    28: 'Distrust not the fear of the Lord when thou art poor: and come not unto him with a double heart.',
    29: 'Be not an hypocrite in the sight of men, and take good heed what thou speakest.',
    30: 'Exalt not thyself, lest thou fall, and bring dishonour upon thy soul, and so God discover thy secrets, and cast thee down in the midst of the congregation, because thou camest not in truth to the fear of the Lord, but thy heart was full of deceit.',
  },
};

/**
 * Checks whether text is a fabricated placeholder or Amharic text leaking into an English field
 */
export function isFabricatedEnglish(text?: string | null): boolean {
  if (!text) return false;
  const trimmed = text.trim();
  // Pattern matching bracketed reference tags like [book of sirach 1:1] or [Genesis 1:1]
  if (/^\[.+?\s\d+:\d+\]/.test(trimmed)) return true;
  // If the English field contains Amharic Ethiopic characters, it is NOT genuine English
  if (/[\u1200-\u137F]/.test(trimmed)) return true;
  return false;
}

/**
 * Removes any unwanted English reference headers like [book of sirach 1:1] from verse text
 */
export function cleanAmharicVerse(text: string): string {
  if (!text) return '';
  return text.replace(/^\[.*?\]\s*/g, '').trim();
}

/**
 * Returns genuine offline English verse if bundled, or empty string if not available.
 * NEVER fabricates fake translations or mixes languages.
 */
export function getOfflineEnglishVerse(
  bookId: string,
  chapterId: string,
  verseNum: number
): string {
  const key = `${bookId}_${chapterId}`;
  const chapterData = BUNDLED_ENGLISH_CHAPTERS[key];
  if (chapterData && chapterData[verseNum]) {
    return chapterData[verseNum];
  }
  return '';
}

/**
 * Resolves English verses for a chapter using authentic bundled data.
 * Does NOT fabricate text when genuine translations are unavailable.
 */
export async function resolveChapterEnglish(
  bookId: string,
  chapterId: string,
  localVerses: Array<{ verse: number; textAm: string; textEn?: string }>,
  bookNameEn?: string
): Promise<Array<{ verse: number; textAm: string; textEn: string }>> {
  const key = `${bookId}_${chapterId}`;
  const bundled = BUNDLED_ENGLISH_CHAPTERS[key];

  return localVerses.map(v => {
    let enText = '';

    if (v.textEn && v.textEn.trim().length > 0 && !isFabricatedEnglish(v.textEn)) {
      enText = v.textEn.trim();
    } else if (bundled && bundled[v.verse]) {
      enText = bundled[v.verse];
    }

    return {
      verse: v.verse,
      textAm: cleanAmharicVerse(v.textAm),
      textEn: enText,
    };
  });
}

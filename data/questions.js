import {getUserById} from "./users.js";
import {getLocalBirds, getAllBirdsNames} from "./birds.js";
const getQuestions = async (userId)=>{
    let userGiven =  await getUserById(userId);
    let city = userGiven["geocode"]["city"];
    let country = userGiven["geocode"]["countryCode"];
    let birdsCity,birdsCountry;
    try{
        birdsCity =await getLocalBirds(country,city);
    }catch(error){
        console.log(error);
    }
    try{
        birdsCountry =await getLocalBirds(country,"all");
    }catch(error){
        console.log(error);
    }
    
    let questionsSeen = userGiven["last_questions"];
    let names = await getAllBirdsNames();
    let questions = [];
    for( let index=0;index<birdsCity.length;index++){
        const birdid = birdsCity[index]['_id'];
        if(!questionsSeen.includes(birdid)){
            const url=birdsCity[index]['url'];
            const correct = birdsCity[index]['names'][0];
            const options = [];
            options.push(correct);
            const difficulty = birdsCity[index]['difficulty'];
            while(true){
                const option = names[Math.floor(Math.random()*names.length)];
                if(!options.includes(option)){
                    options.push(option);
                }
                if(options.length==4){
                    break;
                }
            }
            let question = {
                url,correct,options,difficulty
            };
            questions.push(question);
        }
    }
    let birdsCityIds=birdsCity.map(a => a._id);
    for( let index=0;index<birdsCountry.length;index++){
        const birdid = birdsCountry[index]['_id'];
        if(!questionsSeen.includes(birdid) && !birdsCityIds.includes(birdid)){
            const url=birdsCountry[index]['url'];
            const correct = birdsCountry[index]['names'][0];
            const options = [];
            options.push(correct);
            const difficulty = birdsCountry[index]['difficulty'];
            while(true){
                const option = names[Math.floor(Math.random()*names.length)];
                if(!options.includes(option)){
                    options.push(option);
                }
                if(options.length==4){
                    break;
                }
            }
            let question = {
                url,correct,options,difficulty
            };
            questions.push(question);
        }
    }
    return questions;
};
export{
    getQuestions,
};
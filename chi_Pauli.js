/* Start by defining some of the constants */

let precision = 4; // how many sigfigs we want...

// Information for solvents...
let components = [
	{
		type : "solvent",
		name : "chloroform",
		MW 		: 	119.38, // g/mol
		density : 	1.492, // g/mL
		chi_mol :  -5.21E-5, // mL/mol
	},

	{
		type : "solvent",
		name : "dichloromethane",
		MW 		: 	84.93, // g/mol
		density : 	1.3266, // g/mL
		chi_mol :  -4.586E-5, // mL/mol; calculated using parameters from Marcus solvent book
	},

	{
		type : "solvent",
		name : "hexanes", //note the "s" at the end
		MW 		: 	86.178, // g/mol; calculated
		density : 	0.672, // g/mL; from Aldrich
		chi_mol :  -7.46E-5,// mL/mol; assumed to be the same as n_hexane
	},

	{
		type : "solvent",
		name : "n-hexane", // needs to match what is in the drop down selector
		MW 		:	86.172, // g/mol; calculated
		density : 	0.659, // g/mL; from aldrich
		chi_mol :  -7.46E-5,// mL/mol; calculated from chi_mol
	},

	{
		type : "solvent",
		name : "THF",
		MW 		: 	72.107, // g/mol
		density : 	0.8876, // g/mL
		chi_mol :  -5.21E-5, // mL/mol
	},


// Information for the ligands...

	{
		type : "ligand",
		name: "butanethiol",
		MW 		: 	89.182,
		density : 	0.83679,
		chi_mol :  -6.54E-5,
	},

	{
		type : "ligand",
		name : "hexanethiol",
		MW 		: 	117.232,
		density : 	0.832,
		chi_mol :  -8.91E-5,
	},

	{
		type : "ligand",
		name: "heptanethiol",
		MW 		: 	131.262,
		density : 	0.844,
		chi_mol :  -1.01E-4,
	},

	{
		type : "ligand",
		name : "octanethiol",
		MW 		: 	145.282,
		density : 	0.843,
		chi_mol :  -1.13E-4,
	},

	{
		type : "ligand",
		name : "nonanethiol",
		MW 		: 	145.282,
		density : 	0.842,
		chi_mol :  -1.25E-4,
	},

	{
		type : "ligand",
		name : "decanethiol",
		MW 		: 	173.342,
		density : 	0.824,
		chi_mol :  -1.37E-4,
	},

	{
		type : "ligand",
		name : "unadecanethiol",
		MW 		: 	187.362,
		density : 	0.841,
		chi_mol :  -1.48E-4,
	},

	{
		type : "ligand",
		name : "dodecanethiol",
		MW 		: 	201.392,
		density : 	0.845,
		chi_mol :  -1.60E-4,
	},

// Information for metals we want to use...
	{
		type : "metal",
		name: 'gold',
		effective_mass: 1.1, // unitless; from 'principles of electronic materials and devices, second edition'
		density: 		19.32, // g/mL; taken from wikipedia
		chi_vol: 	   -3.50E-5, // unitless; experimental, from PRL 108, 047201 (2012)
	},
	
	{
		type : "metal",
		name: "silver",
		effective_mass: 0.99, // unitless, from 'principles of electronic materials and devices, second edition'
		density: 		10.49, // g/mL; taken from wikipedia
		chi_vol: 	   -2.60E-5, // unitless, from J. Phys. Chem. Solids 28, 523, 1967
	},
	{
		type : "metal",
		name: "palladium",
	},
];

// Define constants...
const mu_0 = 1.25663706212E-6; // H*m^-1
const mu_B = 9.2740100783E-24; // J*T^-1
const pi =   3.141592654; //unitless
const eV_J = 6.242E+18; // unitless



/*
There are 3 parts to the page.
1. A part where we ask how many components there are of metal, solvent, or ligand. 
	Whenever this is updated, we can add/remove components.
	Default value is 1/n*100 percent
2. A part where we ask the identity and percentage of the components. 
	Whenever this is updated, we can calculate the average for the section, and display the averages and the individuals
3. A part where we calculate the chi_Pauli, using the averages. 
	This can be invoked each time we update #2
	But we can check and only calculate if we have all the information we need. 

*/

//define the sections to write on input...

ligand_section = `
<p class = "ligand">&emsp;&emsp;Ligand:
    <select class= "ligandName" name="ligand" id="name" onchange = "prepare_cal_values('ligand')">
      <option value="none" selected disabled hidden>Select an Option</option>
      <option value="butanethiol">butanethiol</option>
      <option value="hexanethiol">hexanethiol</option>
      <option value="octanethiol">octanethiol</option>
      <option value="decanethiol">decanethiol</option>
      <option value="dodecanethiol">dodecanethiol</option>
    </select>
    %
    <input class= "ligandPercent" size='5' id='percent' name='percent' value='100' onchange = "prepare_cal_values('ligand')"/>
    &emsp;&emsp;
    MW: <span id = "property1"></span> g/mol &emsp;&emsp;
    density: <span id = "property2"></span> g/mL &emsp;&emsp;
    chi_mol: <span id = "property3"></span> mol/g
  </p>
`

solvent_section = `
<p class = "solvent">&emsp;&emsp;Solvent:
    <select class= "solventName" name="solvent" id="name" onchange = "prepare_cal_values('solvent')">
    <option value="none" selected disabled hidden>Select an Option</option>
    <option value="chloroform">chloroform</option>
    <option value="dichloromethane">dichloromethane</option>
    <option value="hexanes">hexanes</option>
    <option value="n_hexane">n-hexane</option>
  </select>
  %
  <input class= "solventPercent" size='5' id='percent' name='percent' value='100' onchange = "prepare_cal_values('solvent')"/>
    &emsp;&emsp;
  MW: <span id = "property1"></span> g/mol &emsp;&emsp;
  density: <span id = "property2"></span> g/mL &emsp;&emsp;
  chi_mol: <span id = "property3"></span> mol/g
  </p>
`

metal_section = `
<p class = "metal">&emsp;&emsp;Metal:
    <select class= "metalName" name="metal" id="name" onchange = "prepare_cal_values('metal')">
    <option value="none" selected disabled hidden>Select an Option</option>
    <option value="gold">gold</option>
    <option value="silver">silver</option>
    <option value="palladium">palladium</option>
  </select>
  %
  <input class= "metalPercent" size='5' id='percent' name='percent' value='100' onchange = "prepare_cal_values('metal')"/>
    &emsp;&emsp;
  m<sub>e</sub>: 		<span id = "property1"></span>  &emsp;&emsp;
  density: 	<span id = "property2"></span> g/mL &emsp;&emsp;
  chi_vol: 	<span id = "property3"></span>
  </p>
`


//
// functions we will need to use
//

// function to calculate all the required chi values, update anytime ANYTHING changes...
function chi_Pauli_calculation(
		NMRshift, f_core,
		effective_mass, rho_core, chi_core_vol,
		MW_solvent, rho_solvent, chi_solvent_mol,
		MW_shell, rho_shell, chi_shell_mol
		){
	//
	// start the calculation
	//
	
	f_shell = 1 - f_core; // for convenience
	xi_mass = f_shell / f_core // for convenience

	chi_obs_mass = 3/(4*pi) * NMRshift/1E6; // step 0

	chi_obs_vol = ((f_core/rho_core) + (f_shell/rho_shell))**(-1) * chi_obs_mass// Step 1



	// we are now ready to calculate the target chi values...
	//step 2
	chi_core_vol =  (1 + rho_core / rho_shell * xi_mass)**(-1) * chi_core_vol 

	//step 3
	chi_shell_vol = (1 + rho_shell/rho_core * xi_mass**(-1))**(-1) * chi_shell_mol * rho_shell / MW_shell 

	//step 4
	chi_solvent_vol = 1 * chi_solvent_mol * rho_solvent / MW_solvent

	

	// Equation S6
	chi_conduction_vol = chi_obs_vol - chi_core_vol - chi_shell_vol + chi_solvent_vol // what is left MUST be from the conduction electrons...
	chi_Pauli_vol = chi_conduction_vol / (1 - 1/3 * effective_mass**-2)

	// this follows...
	chi_Landau_vol = -1 * (1/effective_mass)**2 * chi_Pauli_vol/3

	//so we can get a density of states
	dos_EF = chi_Pauli_vol / (mu_0 * mu_B**2)
	
	//now update the different chi values
	// if (chi_Pauli_vol != NaN){}
	document.getElementById("final_Pauli_chi_vol").innerText = chi_Pauli_vol.toExponential(precision);
	document.getElementById("final_Landau_chi_vol").innerText = chi_Landau_vol.toExponential(precision);
	document.getElementById("final_core_chi_vol").innerText = chi_core_vol.toExponential(precision);
	document.getElementById("final_ligands_chi_vol").innerText = chi_shell_vol.toExponential(precision);
	document.getElementById("final_solvent_chi_vol").innerText = chi_solvent_vol.toExponential(precision);
	document.getElementById("final_DOS").innerText = dos_EF.toExponential(precision);
};



// to update the number of items to reflect what was requested...
function update_number_of_selectors(name){
	//console.log("section length = " + document.getElementsByClassName(name).length)
	//console.log("needed length = " + document.getElementById(name+"NumRequested").value)
	to_write = ""
	if (name == "ligand"){to_write = ligand_section};
	if (name == "solvent"){to_write = solvent_section};
	if (name == "metal"){to_write = metal_section};
	document.getElementById(name + "_specifications").innerHTML = ""; //start this being empty...
	for (i = 0; i < document.getElementById(name+"NumRequested").value; i++){
		//temp_list = document.querySelectorAll("."+name)
		//temp_list[temp_list.length-1].after(ligand_section)
		//write the sections... to start with the percent will be 100%.  we will fix this in a second...
		document.getElementById(name + "_specifications").innerHTML += to_write;
	};
	//use this to adjust the default value for percentage... just divide 100 by the number we have, use floor to ensure we have ints
	running_percentage = 0
	percentage_in = document.getElementsByClassName(name + "Percent")
	for (i = 0; i < percentage_in.length; i++){
		percentage_in[i].value = Math.floor(100/document.getElementById(name+"NumRequested").value)
		running_percentage = running_percentage + Number(percentage_in[i].value) //take the value we just recorded, and add it to our running total
	};
	//this corrects the first value, so that we ensure we always have 100% in total
	percentage_in[0].value = Number(percentage_in[0].value) + (100 - running_percentage) // gets how much we are off of 100, and adds it to the value for the first cell
};


function average_individual_info(type){
	// these will hold the number averaged properties...
	let ave_prop1 = 0
	let ave_prop2 = 0
	let ave_prop3 = 0

	let all = true
	let total = 0

	let section_info = document.getElementsByClassName(type);
	if (section_info.length > 0){//check to make sure there is an entry...
		for (i=0; i < section_info.length; i++){
			let name = section_info[i].children.name.value // get the selection from drop down menu
			total = total + Number(section_info[i].children.percent.value)
			if (name == "none"){all = false}; // if we haven't yet finished selecting things for the section...
			for (j = 0; j < components.length; j++){ //now go looking for that name
				if (components[j].type === type & components[j].name === name){ // we found the corresponding information
					//update the html...
					section_info[i].children.property1.innerText = Object.values(components[j])[2].toFixed(precision); // Object.values is how we can access dictionary values by index
					ave_prop1 = Number(ave_prop1) + Number(Object.values(components[j])[2]) * Number(section_info[i].children.percent.value)/100

					section_info[i].children.property2.innerText = Object.values(components[j])[3].toFixed(precision);
					ave_prop2 = ave_prop2 + Object.values(components[j])[3] * section_info[i].children.percent.value/100

					section_info[i].children.property3.innerText = Object.values(components[j])[4].toExponential(precision);
					ave_prop3 = ave_prop3 + Object.values(components[j])[4] * section_info[i].children.percent.value/100
				};
			};
		};
	};
	if (total == 100){
		if (all == true){ // check to see if all the values have been selected.  If not, then no use writing out the averages...
			document.getElementById(type + "_prop1_ave").innerText = ave_prop1.toFixed(precision);
			document.getElementById(type + "_prop2_ave").innerText = ave_prop2.toFixed(precision);
			document.getElementById(type + "_prop3_ave").innerText = ave_prop3.toExponential(precision);

			return [ave_prop1, ave_prop2, ave_prop3];
		};
	} else {
		document.getElementById(type + "_prop1_ave").innerHTML = "<span style='background-color:#ff6347;''> PERCENTAGES DO NOT TOTAL 100% </span>";
		document.getElementById(type + "_prop2_ave").innerText = "";
		document.getElementById(type + "_prop2_ave").innerText = ""
	};
};

function prepare_cal_values(){ // values for the chi_Pauli calc
	let shift;
	let f_core;
	let check // for checking
	if (Number(document.getElementById("NMRshift").value) 	 != NaN){shift = Number((document.getElementById("NMRshift").value).replace(/−/, "-"))}; // the replace will replace a hyphen with a minus sign.  https://stackoverflow.com/questions/74012348/how-to-replace-hyphen-minus-with-minus
	if (Number(document.getElementById("coreFraction").value) != NaN){
		check = Number(document.getElementById("coreFraction").value)
		//console.log("check is == " + typeof(check) + " and = " + check)
		if (check > 0 && check <=100){ 
		f_core = Number(document.getElementById("coreFraction").value/100);
		document.getElementById("f_coreAlert").innerText = "";
		//console.log("check type = " + typeof(check));
		} else if (isNaN(check) != true){document.getElementById("f_coreAlert").innerText = "CORE FRACTION NOT BETWEEN 0 AND 100"};
	};
	//console.log(shift);
	//console.log(f_core);

	let ave_metal_properties = average_individual_info("metal");
	let ave_solvent_properties = average_individual_info("solvent");
	let ave_ligand_properties = average_individual_info("ligand");
	//console.log(ave_metal_properties);
	//console.log(ave_solvent_properties);
	//console.log(ave_ligand_properties);
	if ( //check to make sure we have good values for everything, if so, we can calculate chi_Pauli
		shift != undefined &&
		f_core != undefined &&
		ave_metal_properties != undefined &&
		ave_solvent_properties != undefined &&
		ave_ligand_properties != undefined
		){
	
		chi_Pauli_calculation(
			shift, f_core,
			ave_metal_properties[0], 	ave_metal_properties[1], 	ave_metal_properties[2],
			ave_solvent_properties[0], ave_solvent_properties[1], ave_solvent_properties[2],
			ave_ligand_properties[0], 	ave_ligand_properties[1], 	ave_ligand_properties[2]
			); // we have everything we need... so calculate chi_Pauli now!
	};
};











// update info shown...
function update_info_section(sec){
	if (sec == "metal"){section = metal// make sure we are dealing with the correct stuff. 
		let name = document.getElementById(sec).value;
		//console.log("current name:" + name);
		for (let i = 0; i < section.length; i++){
			//console.log(section[i].name)
			if (section[i].name === name){
				document.getElementById(sec+"first").innerText = "effective mass: " + section[i].effective_mass;
				document.getElementById(sec+"rho").innerText = "density: " + section[i].density + "g/mL";
				document.getElementById(sec+"chi").innerText = "\u03C7 (vol): " + section[i].chi_vol.toExponential(precision);
			};
		};
	};
	if (sec == "solvent"){section = solvent
		let name = document.getElementById(sec).value;
		//console.log("current name:" + name);
		for (let i = 0; i < section.length; i++){
			//console.log(section[i].name)
			if (section[i].name === name){
				document.getElementById(sec+"first").innerText = "MW: " + section[i].MW;
				document.getElementById(sec+"rho").innerText = "density: " + section[i].density + "g/mL";
				document.getElementById(sec+"chi").innerText = "\u03C7 (mol): " + section[i].chi_mol.toExponential(precision);
			};
		};
	};// make sure we are dealing with the correct stuff. 
	if (sec == "ligand"){section = ligand
		let name = document.getElementById(sec).value;
		//console.log("current name:" + name);
		for (let i = 0; i < section.length; i++){
			//console.log(section[i].name)
			if (section[i].name === name){
				let test = 9
				//document.getElementById(sec+"first").innerText = "MW: " + section[i].MW;
				//document.getElementById(sec+"rho").innerText = "density: " + section[i].density + "g/mL";
				//document.getElementById(sec+"chi").innerText = "\u03C7 (mol): " + section[i].chi_mol.toExponential(precision);
			};
		};
	};// make sure we are dealing with the correct stuff. 
	chi_Pauli_calculation(); // still run the calc...
};



// function to average out the ligand values...
function calculate_weighted_averages (values, percents){
	//console.log(values)
	let w_ave = 0
	for (let i = 0; i < values.length; i++){
		w_ave = w_ave + values[i] * percents[i]/100
	};
	//console.log(w_ave)
	return w_ave
};



	


//document.getElementById("ligandCount").onchange = update_section_fields("ligand")


window.onload = function(){
	update_number_of_selectors("ligand");
	update_number_of_selectors("solvent");
	update_number_of_selectors("metal");
};


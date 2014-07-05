(function($){

	'use strict';

	$.extend($.fn,{
		ajaxLoading: function(options){

			//check whether an ajaxloader is already created, if created, return the ajaxLoader.
			var ajaxLoader=$.data(document.body,'ajaxLoader');
			if(ajaxLoader){
				ajaxLoader.setOptions(options);
				return ajaxLoader;
			}
			ajaxLoader= new $.ajaxLoader(options);
			$.data(document.body,'ajaxLoader',ajaxLoader);
			return ajaxLoader;
		}
	});

	$.ajaxLoader=function(options){
		$.extend(true,{},$.ajaxLoader.settings,options);
		this.init();
	};

	$.extend($.ajaxLoader,{

		prototype:{

			bindings:[],

			settings:{
			onStatistics:false
		    },

			setOptions:function(settings){
				$.extend(this.settings,settings);
			},

			loadResource:function(url,holder,params){
			if(!params){
				this.loadImage(url,holder);
			}
			this.loadObject(url,holder,params);
		    },

			loadImage:function(url,element){
				var img=$('<img/>');

				img.attr('src',url).load(function(){
					$(element).append(img);
				});
			},

			loadObject:function(url,object,params){
				$.get(url,params).done(function(data){
					object=data;
				});
			},

		    register:function(bundles){
				for(var i=0;i<bundles.length;i++){
					this.addBinding(bundles[i]);
				}
		    },


			init:function(){

				var ajaxLoader=$.ajaxLoader.prototype;

				$(document).ajaxSend(function(event,jqxhr,settings){
					var url=settings.url;
					var binding=ajaxLoader.getStartBinding(url);

					if(binding){
						ajaxLoader.loadStart(binding[0]);
						if(ajaxLoader.settings.onStatistics){
							binding[1].timeStamp.push(new Date());
							binding[1].times+=1;
						}
					}


				});

				$(document).ajaxComplete(function(event,jqxhr,settings){
					var url=settings.url;
					var binding=ajaxLoader.getEndBinding(url);
					if(binding){
						ajaxLoader.loadEnd(binding[0]);
						if(ajaxLoader.settings.onStatistics){
							binding[1].timeStamp.push(new Date());
						}
					}
						
				});

			},

			addBinding:function(binding){
				var bindings=this.bindings;
				for(var i=0;i<bindings.length;i++){
					if(binding.url===bindings[i].url){
						$.extend(true,bindings[i],binding);
						return false;
					}
				}
				bindings.push({
					url:binding.url,
					element:binding.element,
					src:binding.src,
					type:binding.type,
					timeStamp:[],
					times:0
				});
				return false;
			},

			getStartBinding:function(url){
				var binding=this.bindings;

				for(var i=0;i<binding.length;i++){
					if(binding[i].url===url){
						return [binding[i],binding[i]];
					}
					if(binding[i].url.constructor==Array){
						if(binding[i].url[0]===url){
							var _binding=$.extend(true,{},binding[i]);
							_binding.url=url;
							return [_binding,binding[i]];
						}
					}
				}
			},

			getEndBinding:function(url){
				var binding=this.bindings;

				for(var i=0;i<binding.length;i++){
					if(binding[i].url===url){
						return [binding[i],binding[i]];
					}
					if(binding[i].url.constructor==Array){
						if(binding[i].url[1]===url){
							var _binding=$.extend(true,{},binding[i]);
							_binding.url=url;
							return [_binding,binding[i]];
						}
					}
				}
			},

			getTimeCost:function(binding){
				return binding.timeStamp[1].getTime()-binding.timeStamp[0].getTime();
			},

			getStatistics:function(callback){
				if(callback.constructor==Function){
					$(document).ajaxStop(function(){
						var result=[],
				        bindings=$.ajaxLoader.prototype.bindings;

						for(var i=0;i<bindings.length;i++){
							result.push({
								url:bindings[i].url,
								timeCost:$.ajaxLoader.prototype.getTimeCost(bindings[i]),
								times:bindings[i].times
							});
						}
						callback(result);
					});
				}
			},

			loadStart:function(binding){
				var type=binding.type,
				element=binding.element,
				src=binding.src;

				if(!$(element)){
					return false;
				}

				$(element).empty();

				if(type==="text"){
					$(element).append(src);
				}

				if(type==="image"){
					var image=$('<img />');
					image.attr('src',src);
					$(element).append(image);
				}
			},

			loadEnd:function(binding){
				var element=binding.element;

				if(!$(element)){
					return false;
				}

				$(element).empty();
			}

	    }
	});

})(jQuery);
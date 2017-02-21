function binary(widget_id, url, parameters)
{
    // Store Args
    this.widget_id = widget_id
    this.parameters = parameters
    
    // Add in methods
    this.on_ha_data = on_ha_data
    this.get_state = get_state
    this.toggle = toggle
    this.call_service = call_service
    
    // Create and initialize bindings
    this.ViewModel = 
    {
        title: ko.observable(parameters.title),
        icon: ko.observable(),
        icon_style: ko.observable(),
        state_text: ko.observable()
    };
    
    ko.applyBindings(this.ViewModel, document.getElementById(widget_id))

    // Do some setup
    
    this.state = "off"
    this.icon_on = "fa-lightbulb-o";
    if  ("icon_on" in parameters)
    {
        this.icon_on = parameters["icon_on"];
    }

    this.icon_off = "fa-lightbulb-o";
    if  ("icon_off" in parameters)
    {
        this.icon_off = parameters["icon_off"];
    }
    
    this.state_active = "on";
    if ("state_active" in parameters)
    {
        this.state_active = parameters["state_active"]
    }

    this.state_inactive = "off";
    if ("state_inactive" in parameters)
    {
        this.state_inactive = parameters["state_inactive"]
    }

    // Setup Override Styles
    
    if ("background_color" in parameters)
    {
        $('#' + widget_id).css("background-color", parameters["background_color"])
    }
        
    if ("icon_size" in parameters)
    {
        $('#' + widget_id + ' > h2').css("font-size", parameters["icon_size"])
    }
    
    if ("title_color" in parameters)
    {
        $('#' + widget_id + ' > h1:nth-of-type(1)').css("color", parameters["title_color"])
    }
    
    if ("title_size" in parameters)
    {
        $('#' + widget_id + ' > h1:nth-of-type(1)').css("font-size", parameters["title_size"])
    }    

    if ("state_color" in parameters)
    {
        $('#' + widget_id + ' > h1:nth-of-type(2)').css("color", parameters["state_color"])
    }
    
    if ("state_size" in parameters)
    {
        $('#' + widget_id + ' > h1:nth-of-type(2)').css("font-size", parameters["state_size"])
    }    

    // Get initial state
    this.get_state(url, parameters.state_entity)
    // Define onClick handler
    
    if ("post_service_active" in parameters || "post_service_inactive" in parameters)
    {
        var that = this
        $('#' + widget_id + ' > h2').click(
            function()
            {
                console.log("click")
                args = "";
                if (that.state == that.state_active)
                {
                    if ("post_service_inactive" in parameters)
                    {
                        args = parameters["post_service_inactive"]
                    }
                }
                else
                {
                    if ("post_service_active" in parameters)
                    {
                        args = parameters["post_service_active"]
                    }
                }
                if (args != "")
                {
                    that.toggle();
                    that.call_service(url, args)
                }
                if ("momentary" in parameters)
                {
                    setTimeout(function() { that.toggle() }, parameters["momentary"])
                }
            }
        )
    }
    // Methods

    function toggle()
    {
        if (this.state == this.state_active)
        {
            this.state = this.state_inactive;
        }
        else
        {
            this.state = this.state_active
        }
        set_view(this, this.state)
    }
    
    function on_ha_data(data)
    {
        if ("state_entity" in parameters && data.event_type == "state_changed" && data.data.entity_id == this.parameters.state_entity)
        {
            this.state = data.data.new_state.state
            set_view(this, this.state)
        }
    }
    
    function call_service(base_url, args)
    {
        var that = this;
        service_url = base_url + "/" + "call_service";
        $.post(service_url, args);    
    }
        
    function get_state(base_url, entity)
    {
        if ("state_entity" in parameters)
        {
            var that = this;
            state_url = base_url + "/state/" + entity;
            $.get(state_url, "", function(data)
            {
                if (data.state == null)
                {
                    that.ViewModel.title("Entity not found")
                }
                else
                {
                    that.state = data.state.state;
                    set_view(that, that.state)
                    if ("title_is_friendly_name" in that.parameters)
                    {
                        if ("friendly_name" in data.state.attributes)
                        {
                            that.ViewModel.title(data.state.attributes["friendly_name"])
                        }
                        else
                        {
                            that.ViewModel.title(that.widget_id)
                        }
                    }

                }
            }, "json");
        }
        else
        {
            set_view(this, "off")
        }
    };
    
    function set_view(self, state)
    {
        
        if (state == self.state_active)
        {
            if ("icon_color_active" in parameters)
            {
                $('#' + widget_id + ' > h2').css("color", parameters["icon_color_active"])
            }
            else
            {
                if ("warn" in self.parameters && self.parameters["warn"] == 1)
                {
                    $('#' + widget_id + ' > h2').css("color", "")
                    self.ViewModel.icon_style("icon-active-warn")
                }
                else
                {
                    $('#' + widget_id + ' > h2').css("color", "")
                    self.ViewModel.icon_style("icon-active")                
                }
            }
            self.ViewModel.icon(self.icon_on.split("-")[0] + ' ' + self.icon_on)
        }
        else
        {
            if ("icon_color_inactive" in parameters)
            {
                $('#' + widget_id + ' > h2').css("color", parameters["icon_color_inactive"])
            }
            else
            {
                $('#' + widget_id + ' > h2').css("color", "")
                self.ViewModel.icon_style("icon-inactive")
            }
            self.ViewModel.icon(self.icon_off.split("-")[0] + ' ' + self.icon_off)            
        }
        
        if ("state_text" in self.parameters && self.parameters["state_text"] == 1)
        {
            if ("state_map" in self.parameters && state in self.parameters["state_map"])
            {
                self.ViewModel.state_text(self.parameters["state_map"][state]);
            }
            else
            {
                self.ViewModel.state_text(state);
            }
        }
        
    }
}
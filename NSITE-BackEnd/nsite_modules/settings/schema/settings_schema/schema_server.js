


const ftpProps = {
    properties:{
        name:{
            description:'Name of the FTP device (can only be used once)',
            type:'string',
            required:true,
        },
        host:{
            description:'IP addess of FTP device',
            type:'string',
            format:'ip-address',
            required:true,
        },
        port:{
            description:'FTP port number (defults to 21 if omited)',
            type:'number',
            required:false,
        },
        user:{
            description:'FTP user name (defults to a empty string if omited)',
            type:'string',
            required:false,
        },
        pass:{
            description:'FTP password (defults to a empty string if omited)',
            type:'string',
            required:false,
        },
    }
}


module.exports = {      
    server:{
        properties: {
            facility:{
                description:'Name of the truck/facility',
                type:'string',
                required: true
            },
            webAppPort:{
                description:'The port number the web app will run on.',
                type:'number',
                required: true
            },
            broker:{
                description:'The port number MQTT broker will run on.',
                type:'number',
                required: true
            },
            snapshotDays:{
                description:'How long to keep system snapshots.',
                type:'number',
                required: true,
                maximum: 8,
                minimum: 1
            },
            influxDB:{
                description:'InfluxDB settings.',
                type:'object',
                required: true,
                properties:{
                    host:{
                        description:'InfluxDB host IP address',
                        type: 'string',
                        formate:'ip-address',
                        required: true
                    },
                    database:{
                        description:'InfluxDB name',
                        type: 'string',
                        required: true
                    },
                    port:{
                        description:'InfluxDB port number',
                        type: 'number',
                        required: true
                    },
                    retentionPolicy:{
                        description:'InfluxDB retention policy settings',
                        type: 'object',
                        required: true,
                        properties:{
                            name:{
                                description:'InfluxDB retention policy name',
                                type:'string',
                                required:true
                            },
                            duration:{
                                description:'InfluxDB retention policy duration',
                                type: 'string',
                                required: true
                            },
                            replication:{
                                description:'InfluxDB retention policy replication',
                                type: 'number',
                                required: true
                            },
                            isDefault:{
                                description:'InfluxDB retention policy default',
                                type: 'boolean',
                                required: true
                            }
                        }
                    }
                }
            },
            ftp:{
                description:'Name of the truck/facility',
                type: 'object',
                required: false,
                additionalProperties:false,
                properties:{  
                    power_logs:{
                        description:'Power Logging devices',
                        type:'array',
                        required:false,
                        items:{
                            type:'object',
                            additionalProperties:false,
                            properties:{
                                name:{
                                    description:'Name of the FTP device (can only be used once)',
                                    type:'string',
                                    required:true,
                                },
                                host:{
                                    description:'IP addess of FTP device',
                                    type:'string',
                                    format:'ip-address',
                                    required:true,
                                },
                                port:{
                                    description:'FTP port number (defults to 21 if omited)',
                                    type:'number',
                                    required:false,
                                },
                                user:{
                                    description:'FTP user (defults to a empty string if omited)',
                                    type:'string',
                                    required:false,
                                },
                                pass:{
                                    description:'FTP password (defults to a empty string if omited)',
                                    type:'string',
                                    required:false,
                                },

                            }
                        }
                    },
                    alarms:{
                        description:'Alarm Logging devices',
                        type:'array',
                        required:false,
                        items:{
                            type:'object',
                            additionalProperties:false,                         
                            properties:{
                                name:{
                                    description:'Name of the FTP device (can only be used once)',
                                    type:'string',
                                    required:true,
                                },
                                host:{
                                    description:'IP addess of FTP device',
                                    type:'string',
                                    format:'ip-address',
                                    required:true,
                                },
                                port:{
                                    description:'FTP port number (defults to 21 if omited)',
                                    type:'number',
                                    required:false,
                                },
                                user:{
                                    description:'FTP user (defults to a empty string if omited)',
                                    type:'string',
                                    required:false,
                                },
                                pass:{
                                    description:'FTP password (defults to a empty string if omited)',
                                    type:'string',
                                    required:false,
                                },

                            }
                        }
                    }
                }
            }
        }
    }
}
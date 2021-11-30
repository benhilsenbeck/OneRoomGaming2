pipeline {
    agent any
    environment{
        CI = 'true'
    }
    options {
        skipStagesAfterUnstable()
    }
    stages {   
        stage('Build') {
            steps {
                sh 'npm install --prefix frontend'
            }
        }
        stage('Test'){
            steps{
                //eventually ill have a way to test
                echo 'testing...'
            }
        }
        stage('Push to Staging'){
            when {
                not {branch 'staging'}
                not {branch 'production'}
                not {branch 'master'}
                not {tag 'release-v*'}
            }
            steps{
                withCredentials([usernamePassword(credentialsId: 'secret-token-2', passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USERNAME')]) {
                        sh """
                            git push https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/benhilsenbeck/OneRoomGaming.git HEAD:staging
                        """
                    }
                }
        }
        stage('Deploy frontend to staging'){
            when {
                branch 'staging'
            }
            steps{
                sh """
                    sudo cp -rf /home/benhi/sambashare/OneRoomGaming/frontend/src/static/videos /var/lib/jenkins/workspace/OneRoomGaming_staging/frontend/src/static/

                    sudo npm run build:staging --prefix frontend/

                    sudo rm -rf /var/www/html/oneroomgaming/*

                    sudo cp -rf frontend/build/* /var/www/html/oneroomgaming
                """
            }
        }
        stage('Deploy backend to staging'){
            when {
                branch 'staging'
            }
            steps{
                sh """
                    sudo rm -rf /home/benhi/backend/oneroomgaming/staging/*

                    sudo cp -rf backend/* /home/benhi/backend/oneroomgaming/staging

                    sudo cp -rf /home/benhi/backend/oneroomgaming/settings.py /home/benhi/backend/oneroomgaming/staging/ORG

                    sudo systemctl restart apache2
                """
            }
        }

        stage('Deploy frontend to production'){
            when {
                tag 'release-v*'
            }
            steps{
                sh """
                    sudo cp -rf /home/benhi/sambashare/OneRoomGaming/frontend/src/static/videos $WORKSPACE/frontend/src/static/videos

                    sudo npm run build --prefix frontend/

                    sudo rm -rf /var/www/html/oneroomgamingProduction/*

                    sudo cp -rf frontend/build/* /var/www/html/oneroomgamingProduction
                """
            }
        }

        stage('Deploy backend to production'){
            when {
                tag 'release-v*'
            }
            steps{
                sh """
                    sudo rm -rf /home/benhi/backend/oneroomgaming/prod/*

                    sudo cp -rf backend/* /home/benhi/backend/oneroomgaming/prod

                    sudo cp -rf /home/benhi/backend/oneroomgaming/settingsProduction.py /home/benhi/backend/oneroomgaming/prod/ORG/settings.py

                    sudo systemctl restart apache2
                """
            }
        }
    }
}